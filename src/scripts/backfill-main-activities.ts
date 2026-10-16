import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import connectDB from "@/config/db";
import ActivitySchema from "@/schema/activity";
import MainActivitySchema from "@/schema/mainActivity";

type Mapping = { activityId: string; mainActivityName: string };

const args = Bun.argv.slice(2);
const mappingArg = args.indexOf("--mapping");
const mappingPath = mappingArg >= 0 ? args[mappingArg + 1] : undefined;
const auditOutputArg = args.indexOf("--audit-output");
const auditOutputPath = resolve(
  auditOutputArg >= 0 && args[auditOutputArg + 1]
    ? args[auditOutputArg + 1]
    : "main-activity-audit.json",
);
const apply = args.includes("--apply");
let database: Awaited<ReturnType<typeof connectDB>> | undefined;
const validTeams = ["SOSIAL", "PRODUKSI", "DISTRIBUSI", "NERWILIS", "IPDS", "TU"];

const normalizeName = (name: string) => name.trim().replace(/\s+/g, " ").toLocaleLowerCase("id-ID");

const main = async () => {
  database = await connectDB();
  const activities = await ActivitySchema.find({}).select("_id name main mainActivityId year team").lean();
  const summary = new Map<string, { year: number; names: Set<string>; count: number }>();
  let linkedCount = 0;
  let missingCount = 0;
  for (const activity of activities) {
    if (activity.mainActivityId) {
      linkedCount++;
      continue;
    }
    missingCount++;
    const original = String(activity.main ?? "").trim();
    const key = `${activity.team}:${activity.year}:${normalizeName(original) || "<KOSONG>"}`;
    const group = summary.get(key) ?? { year: Number(activity.year), names: new Set<string>(), count: 0 };
    group.names.add(original || "<KOSONG>");
    group.count++;
    summary.set(key, group);
  }

  const audit = activities
    .filter((activity) => !activity.mainActivityId)
    .map((activity) => ({
      activityId: String(activity._id),
      activityName: activity.name,
      team: activity.team,
      year: Number(activity.year),
      legacyMain: String(activity.main ?? "").trim(),
      // Isi nama ini secara manual setelah meninjau nilai legacy dan tahun.
      mainActivityName: "",
    }));
  const auditJson = JSON.stringify(audit, null, 2);
  const mappingUsesAuditFile = mappingPath && resolve(mappingPath) === auditOutputPath;
  if (!mappingUsesAuditFile) {
    await mkdir(dirname(auditOutputPath), { recursive: true });
    await writeFile(auditOutputPath, `${auditJson}\n`, "utf8");
    console.log(`File dasar audit/mapping disimpan: ${auditOutputPath}`);
  } else {
    console.log(`Audit tidak menimpa file mapping yang sedang digunakan: ${auditOutputPath}`);
  }
  console.log(JSON.stringify({ totalActivities: activities.length, linked: linkedCount, awaitingMapping: missingCount, legacyValuesByYear: [...summary.entries()].map(([key, value]) => ({ key, year: value.year, values: [...value.names], count: value.count })) }, null, 2));
  if (!mappingPath) {
    console.log("Audit selesai; tidak ada perubahan database. Isi mainActivityName pada file JSON, lalu gunakan file itu dengan --mapping. Tambahkan --apply hanya setelah mapping disetujui.");
    await database.disconnect();
    return;
  }

  const mappings = JSON.parse(await readFile(mappingPath, "utf8")) as Mapping[];
  if (!Array.isArray(mappings)) throw new Error("Mapping harus berupa array JSON");
  const byId = new Map<string, string>();
  for (const mapping of mappings) {
    const id = String(mapping.activityId ?? "");
    const name = String(mapping.mainActivityName ?? "").trim().replace(/\s+/g, " ");
    if (!id || !name || byId.has(id)) throw new Error(`Mapping tidak valid atau duplikat untuk Activity ${id || "(kosong)"}`);
    byId.set(id, name);
  }

  const unresolved = activities.filter((item) => !item.mainActivityId && !byId.has(String(item._id)));
  const unknownIds = [...byId.keys()].filter((id) => !activities.some((item) => String(item._id) === id));
  if (unresolved.length || unknownIds.length) {
    throw new Error(`Mapping belum lengkap: ${unresolved.length} Activity belum dipetakan; ${unknownIds.length} ID tidak dikenal.`);
  }

  const planned: Array<{ activityId: string; masterName: string; year: number; team: string }> = [];
  for (const activity of activities) {
    if (activity.mainActivityId) continue;
    const name = byId.get(String(activity._id));
    if (!name) continue;
    if (!activity.team) throw new Error(`Activity ${activity._id} tidak memiliki team; lengkapi tim sebelum backfill.`);
    planned.push({ activityId: String(activity._id), masterName: name, year: Number(activity.year), team: activity.team });
  }
  console.log(`Pemetaan valid: ${planned.length} Activity akan ditautkan. Mode: ${apply ? "APPLY" : "DRY-RUN"}.`);
  if (!apply) {
    await database.disconnect();
    return;
  }

  const masters = await MainActivitySchema.collection.find({}).toArray();
  const invalidActivity = await ActivitySchema.exists({
    mainActivityId: { $in: masters.map((master) => master._id) },
    team: { $nin: validTeams },
  });
  if (invalidActivity) throw new Error("Ada Activity yang memakai Kegiatan Utama tanpa team valid; perbaiki datanya sebelum apply.");

  // Replace only old unique indexes, preserving unrelated indexes.
  const indexes = await MainActivitySchema.collection.indexes();
  const outdatedIndexes = indexes.filter((index) => {
    if (!index.unique || index.key.year !== 1 || index.key.normalizedName !== 1) return false;
    const keys = Object.keys(index.key);
    return keys.length === 2 || (keys.length === 3 && index.key.team === 1);
  });
  for (const index of outdatedIndexes) {
    if (index.name) await MainActivitySchema.collection.dropIndex(index.name);
  }

  const mastersByName = new Map<string, typeof masters>();
  for (const master of masters) {
    const key = `${master.year}:${normalizeName(String(master.normalizedName ?? master.name))}`;
    mastersByName.set(key, [...(mastersByName.get(key) ?? []), master]);
  }
  for (const sameNameMasters of mastersByName.values()) {
    const [canonical, ...duplicates] = sameNameMasters;
    const linkedTeams = new Set<string>();
    const oldTeams = sameNameMasters.flatMap((master) => Array.isArray(master.team) ? master.team : master.team ? [master.team] : []);
    for (const master of sameNameMasters) {
      const teams = await ActivitySchema.distinct("team", { mainActivityId: master._id });
      for (const team of teams) {
        if (typeof team === "string" && validTeams.includes(team)) linkedTeams.add(team);
      }
    }
    const teams = [...new Set([...oldTeams, ...linkedTeams])];
    if (!teams.length) teams.push("TU");
    if (teams.some((team) => !validTeams.includes(team))) {
      throw new Error(`Kegiatan Utama ${canonical._id} memiliki team tidak valid.`);
    }
    for (const duplicate of duplicates) {
      await ActivitySchema.updateMany(
        { mainActivityId: duplicate._id },
        { $set: { mainActivityId: canonical._id, main: canonical.name } },
      );
      await MainActivitySchema.collection.deleteOne({ _id: duplicate._id });
    }
    await MainActivitySchema.collection.updateOne(
      { _id: canonical._id },
      {
        $set: {
          team: teams,
          normalizedName: normalizeName(String(canonical.name)),
          isActive: sameNameMasters.some((master) => master.isActive),
        },
      },
    );
  }
  await MainActivitySchema.collection.createIndex({ team: 1, year: 1, normalizedName: 1 }, { unique: true });

  for (const item of planned) {
    const master = await MainActivitySchema.findOneAndUpdate(
      { team: item.team, year: item.year, normalizedName: normalizeName(item.masterName) },
      { $setOnInsert: { name: item.masterName, normalizedName: normalizeName(item.masterName), year: item.year, isActive: true, team: [item.team] } },
      { upsert: true, new: true, runValidators: true },
    );
    await ActivitySchema.updateOne(
      { _id: item.activityId, mainActivityId: null },
      { $set: { mainActivityId: master._id, main: master.name } },
    );
  }

  const remaining = await ActivitySchema.countDocuments({ $or: [{ mainActivityId: { $exists: false } }, { mainActivityId: null }] });
  console.log(`Backfill selesai. Activity tanpa relasi tersisa: ${remaining}.`);
  if (remaining) throw new Error("Backfill belum lengkap; jangan aktifkan cutover relasi wajib.");
  await database.disconnect();
};

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  await database?.disconnect();
  process.exitCode = 1;
});