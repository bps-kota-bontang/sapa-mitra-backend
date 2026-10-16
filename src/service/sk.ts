import { JWT } from "@/model/jwt";
import { SK, SKPosition, SKStaff } from "@/model/sk";
import { Result } from "@/model/result";
import ActivitySchema from "@/schema/activity";
import ContractSchema from "@/schema/contract";
import MainActivitySchema from "@/schema/mainActivity";
import SKSchema from "@/schema/sk";
import { isValidObjectId } from "mongoose";
import { Team } from "@/model/user";

const teamList = (teams: Team[] | Team | null | undefined): Team[] =>
  Array.isArray(teams) ? teams : teams ? [teams] : [];
const canAccess = (teams: Team[] | Team | null | undefined, claims: JWT) =>
  Boolean(claims.team) && (claims.team === "TU" || teamList(teams).includes(claims.team as Team));
const validPositions = ["PENDATAAN", "PEMERIKSAAN", "PENGOLAHAN"] as const;

const loadMainActivity = async (id: string, claims: JWT) => {
  if (!isValidObjectId(id)) return { error: "ID Kegiatan Utama tidak valid", code: 400 as const };
  const mainActivity = await MainActivitySchema.findById(id);
  if (!mainActivity || !canAccess(mainActivity.team, claims)) {
    return { error: "Kegiatan Utama tidak ditemukan", code: 404 as const };
  }
  return { mainActivity };
};

const normalizeStaff = (rawStaff: unknown): SKStaff[] | null => {
  if (!Array.isArray(rawStaff)) return null;
  const normalized: SKStaff[] = [];
  for (const raw of rawStaff) {
    if (!raw || typeof raw !== "object") return null;
    const staff = raw as Record<string, unknown>;
    const source = staff.source === "PARTNER" ? "PARTNER" : staff.source === "MANUAL" ? "MANUAL" : null;
    const name = typeof staff.name === "string" ? staff.name.trim() : "";
    const title = typeof staff.title === "string" ? staff.title.trim() : "";
    const position = typeof staff.position === "string" ? staff.position : "";
    if (!source || !name || !title || !validPositions.includes(position as typeof validPositions[number])) return null;
    let honorRate: number | null = null;
    if (staff.honorRate !== null && staff.honorRate !== undefined && staff.honorRate !== "") {
      honorRate = Number(staff.honorRate);
      if (!Number.isFinite(honorRate) || honorRate < 0) return null;
    }
    if (source === "PARTNER" && (!staff.partnerNik || !staff.activityId)) return null;
    normalized.push({
      source,
      ...(source === "PARTNER" ? {
        partnerNik: String(staff.partnerNik),
        activityId: String(staff.activityId),
        activityName: String(staff.activityName ?? ""),
        activityCode: String(staff.activityCode ?? ""),
      } : {}),
      name,
      title,
      position: position as SKPosition,
      honorRate,
    });
  }
  return normalized;
};

export const getSKs = async (claims: JWT): Promise<Result<any[]>> => {
  if (!claims.team) return { data: [], message: "User tidak memiliki tim", code: 200 };
  const query = claims.team === "TU" ? {} : { team: claims.team };
  const documents = await SKSchema.find(query).sort({ date: -1, createdAt: -1 });
  return { data: documents, message: "Daftar SK berhasil diambil", code: 200 };
};

export const getSK = async (id: string, claims: JWT): Promise<Result<any>> => {
  if (!isValidObjectId(id)) return { data: null, message: "ID SK tidak valid", code: 400 };
  const document = await SKSchema.findById(id);
  if (!document || !canAccess(document.team, claims)) return { data: null, message: "SK tidak ditemukan", code: 404 };
  return { data: document, message: "SK berhasil diambil", code: 200 };
};

export const syncSKStaff = async (mainActivityId: string, claims: JWT): Promise<Result<SKStaff[]>> => {
  const loaded = await loadMainActivity(mainActivityId, claims);
  if ("error" in loaded) return { data: null, message: loaded.error ?? "Kegiatan Utama tidak ditemukan", code: loaded.code ?? 404 };
  const mainActivity = loaded.mainActivity;
  const activities = await ActivitySchema.find({ mainActivityId: mainActivity._id }).select("_id name code category year updatedAt").lean();
  const activityById = new Map(activities.map((activity) => [String(activity._id), activity]));
  const ids = [...activityById.keys()];
  if (!ids.length) return { data: [], message: "Belum ada kegiatan pada Kegiatan Utama ini", code: 200 };

  const contracts = await ContractSchema.find({ "activities._id": { $in: ids } })
    .select("period partner activities createdAt updatedAt")
    .sort({ period: -1, updatedAt: -1, createdAt: -1 })
    .lean();
  const latestByName = new Map<string, {
    period: string;
    contractUpdatedAt: number;
    activityUpdatedAt: number;
    lineDate: number;
    staff: SKStaff;
  }>();
  for (const contract of contracts) {
    for (const line of contract.activities ?? []) {
      const activityId = String((line as any)._id ?? "");
      const activity = activityById.get(activityId);
      if (!activity) continue;
      const partnerNik = String((contract.partner as any)?.nik ?? "").trim();
      if (!partnerNik) continue;
      const position = activity.category === "ENUMERATION" ? "PENDATAAN"
        : activity.category === "SUPERVISION" ? "PEMERIKSAAN"
          : activity.category === "PROCESSING" ? "PENGOLAHAN" : null;
      if (!position) continue;
      const key = String((contract.partner as any)?.name ?? "")
        .trim()
        .replace(/\s+/g, " ")
        .toLocaleLowerCase("id-ID");
      const period = String(contract.period ?? "");
      const contractUpdatedAt = new Date((contract as any).updatedAt ?? (contract as any).createdAt ?? 0).getTime();
      const activityUpdatedAt = new Date((activity as any).updatedAt ?? 0).getTime();
      const lineDate = new Date((line as any).startDate ?? 0).getTime();
      const candidate = {
        source: "PARTNER" as const,
        partnerNik,
        activityId,
        activityName: activity.name,
        activityCode: activity.code,
        name: String((contract.partner as any)?.name ?? "").trim(),
        title: "Mitra Statistik",
        position: position as SKPosition,
        honorRate: Number(line.rate),
      };
      if (!candidate.name || !Number.isFinite(candidate.honorRate)) continue;
      const current = latestByName.get(key);
      const isNewer = !current || period > current.period
        || (period === current.period && contractUpdatedAt > current.contractUpdatedAt)
        || (period === current.period && contractUpdatedAt === current.contractUpdatedAt && activityUpdatedAt > current.activityUpdatedAt)
        || (period === current.period && contractUpdatedAt === current.contractUpdatedAt && activityUpdatedAt === current.activityUpdatedAt && lineDate > current.lineDate);
      if (key && isNewer) {
        latestByName.set(key, { period, contractUpdatedAt, activityUpdatedAt, lineDate, staff: candidate });
      }
    }
  }
  const data = [...latestByName.values()].map(({ staff }) => staff)
    .sort((a, b) => a.name.localeCompare(b.name));
  return { data, message: "Data petugas SPK berhasil disinkronkan", code: 200 };
};

export const createSK = async (payload: Partial<SK>, claims: JWT): Promise<Result<any>> => {
  if (!claims.team) return { data: null, message: "User tidak memiliki tim", code: 403 };
  const mainActivityId = String(payload.mainActivityId ?? "");
  const loaded = await loadMainActivity(mainActivityId, claims);
  if ("error" in loaded) return { data: null, message: loaded.error ?? "Kegiatan Utama tidak ditemukan", code: loaded.code ?? 404 };
  const number = typeof payload.number === "string" ? payload.number.trim() : "";
  const date = payload.date ? new Date(payload.date) : null;
  const staff = normalizeStaff(payload.staff);
  if (!number || !date || Number.isNaN(date.getTime()) || !staff) {
    return { data: null, message: "Nomor, tanggal, dan data petugas wajib valid", code: 400 };
  }
  try {
    const data = await SKSchema.create({
      number,
      date,
      mainActivityId: String(loaded.mainActivity._id),
      mainActivityName: loaded.mainActivity.name,
      year: loaded.mainActivity.year,
      team: teamList(loaded.mainActivity.team),
      staff,
      createdBy: claims.sub,
    });
    return { data, message: "SK berhasil dibuat", code: 201 };
  } catch (error: any) {
    if (error?.code === 11000) return { data: null, message: "Nomor SK sudah digunakan", code: 409 };
    throw error;
  }
};

export const updateSK = async (id: string, payload: Partial<SK>, claims: JWT): Promise<Result<any>> => {
  if (!isValidObjectId(id)) return { data: null, message: "ID SK tidak valid", code: 400 };
  const existing = await SKSchema.findById(id);
  if (!existing || !canAccess(existing.team, claims)) return { data: null, message: "SK tidak ditemukan", code: 404 };
  const mainActivityId = String(payload.mainActivityId ?? existing.mainActivityId);
  const loaded = await loadMainActivity(mainActivityId, claims);
  if ("error" in loaded) return { data: null, message: loaded.error ?? "Kegiatan Utama tidak ditemukan", code: loaded.code ?? 404 };
  const number = typeof payload.number === "string" ? payload.number.trim() : existing.number;
  const date = payload.date === undefined ? existing.date : new Date(payload.date);
  const staff = payload.staff === undefined ? existing.staff as unknown as SKStaff[] : normalizeStaff(payload.staff);
  if (!number || !date || Number.isNaN(new Date(date).getTime()) || !staff) {
    return { data: null, message: "Nomor, tanggal, dan data petugas wajib valid", code: 400 };
  }
  try {
    existing.number = number;
    existing.date = date;
    existing.mainActivityId = String(loaded.mainActivity._id);
    existing.mainActivityName = loaded.mainActivity.name;
    existing.year = loaded.mainActivity.year;
    existing.team = teamList(loaded.mainActivity.team);
    existing.staff = staff as any;
    await existing.save();
    return { data: existing, message: "SK berhasil diperbarui", code: 200 };
  } catch (error: any) {
    if (error?.code === 11000) return { data: null, message: "Nomor SK sudah digunakan", code: 409 };
    throw error;
  }
};

export const deleteSK = async (id: string, claims: JWT): Promise<Result<null>> => {
  if (!isValidObjectId(id)) return { data: null, message: "ID SK tidak valid", code: 400 };
  const existing = await SKSchema.findById(id);
  if (!existing || !canAccess(existing.team, claims)) return { data: null, message: "SK tidak ditemukan", code: 404 };
  await existing.deleteOne();
  return { data: null, message: "SK berhasil dihapus", code: 200 };
};
