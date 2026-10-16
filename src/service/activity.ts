import { convertToCsv, isProduction } from "@/common/utils";
import { Activity } from "@/model/activity";
import { JWT } from "@/model/jwt";
import { Result } from "@/model/result";
import ActivitySchema from "@/schema/activity";
import MainActivitySchema from "@/schema/mainActivity";
import { parse } from "csv-parse/sync";
import { isValidObjectId } from "mongoose";

const serializeActivity = (item: any) => {
  const activity = item.toObject ? item.toObject() : item;
  const mainActivity = activity.mainActivityId && typeof activity.mainActivityId === "object"
    ? activity.mainActivityId
    : null;
  return {
    ...activity,
    mainActivityId: mainActivity?._id ?? activity.mainActivityId,
    mainActivity,
    legacyMain: activity.main ?? "",
    main: mainActivity?.name ?? activity.main ?? "",
  };
};

const validateMainActivity = async (id: string, year: number, allowInactive = false, team?: string, allowLegacyTeam = false) => {
  if (!isValidObjectId(id)) return "Kegiatan Utama wajib dipilih";
  const mainActivity = await MainActivitySchema.findById(id);
  if (!mainActivity) return "Kegiatan Utama tidak ditemukan";
  if (Number(mainActivity.year) !== Number(year)) return "Tahun Kegiatan Utama harus sama dengan tahun Kegiatan";
  if (!allowInactive && !mainActivity.isActive) return "Kegiatan Utama sudah tidak aktif";
  const mainActivityTeams: string[] = Array.isArray(mainActivity.team)
    ? mainActivity.team
    : mainActivity.team ? [mainActivity.team] : [];
  if (team && (!mainActivityTeams.length ? !allowLegacyTeam : !mainActivityTeams.includes(team))) {
    return "Kegiatan Utama harus sesuai dengan tim Kegiatan";
  }
  return null;
};

export const getActivities = async (
  year: string = "",
  claims: JWT,
): Promise<Result<Activity[]>> => {
  let queries: any = {};

  if (claims.team != "TU") queries.team = claims.team;

  if (year) queries.year = year;

  const activities = await ActivitySchema.find(queries)
    .populate("mainActivityId", "name year isActive")
    .sort({ year: -1, _id: 1 });

  const transformedActivities = activities.map((item, index) => {
    return {
      ...serializeActivity(item),
      index: index + 1,
    };
  });

  return {
    data: transformedActivities,
    message: "Successfully retrieved activities",
    code: 200,
  };
};

export const getMainActivities = async (
  year: string | undefined,
): Promise<
  Result<{ main: string; activities: { id: string; name: string }[] }[]>
> => {
  const mainActivities = await MainActivitySchema.find(year ? { year: Number(year) } : {}).sort({ year: -1, name: 1 });
  const grouped = await Promise.all(mainActivities.map(async (mainActivity) => ({
    main: mainActivity.name,
    activities: (await ActivitySchema.find({ mainActivityId: mainActivity._id }).select(["name"]))
      .map((item) => ({ id: String(item._id), name: item.name })),
  })));
  const groupsByName = new Map<string, { main: string; activities: { id: string; name: string }[] }[]>();
  for (const group of grouped.filter((item) => item.activities.length > 0)) {
    const normalized = group.main.trim().replace(/\s+/g, " ").toLocaleLowerCase("id-ID");
    groupsByName.set(normalized, [...(groupsByName.get(normalized) ?? []), group]);
  }
  const legacyQuery: Record<string, any> = { mainActivityId: null, main: { $exists: true, $ne: "" } };
  if (year) legacyQuery.year = Number(year);
  const legacyActivities = await ActivitySchema.find(legacyQuery).select(["main", "name"]);
  for (const activity of legacyActivities) {
    const main = activity.main?.trim();
    if (!main) continue;
    const normalized = main.replace(/\s+/g, " ").toLocaleLowerCase("id-ID");
    const existingGroups = groupsByName.get(normalized);
    const activityItem = { id: String(activity._id), name: activity.name };
    if (existingGroups?.length) {
      existingGroups[0].activities.push(activityItem);
    } else {
      groupsByName.set(normalized, [{ main, activities: [activityItem] }]);
    }
  }
  const groups = [...groupsByName.values()].flat();

  return {
    data: groups,
    message: "Successfully retrieved main activities",
    code: 200,
  };
};

export const getActivity = async (id: string): Promise<Result<Activity>> => {
  const activity = await ActivitySchema.findById(id).populate("mainActivityId", "name year isActive team");

  return {
    data: activity ? serializeActivity(activity) : null,
    message: "Successfully retrieved activity",
    code: 200,
  };
};

export const uploadActivity = async (
  file: File,
  claims: JWT,
): Promise<Result<any>> => {
  if (!file) {
    return {
      data: null,
      message: "No file uploaded",
      code: 400,
    };
  }

  if (file.type != "text/csv") {
    return {
      data: null,
      message: "Only accepts csv file",
      code: 400,
    };
  }

  const fileContent = await file.text();

  const data = parse(fileContent, {
    columns: true,
    delimiter: ";",
    skip_empty_lines: true,
  });

  console.log(`Total records to process: ${data.length}`);

  const invalidRows: number[] = [];
  const mainActivityNames = new Map<string, string>();
  for (const [index, item] of data.entries()) {
    const mainActivityId = String(item.mainActivityId ?? "");
    const validationMessage = await validateMainActivity(mainActivityId, Number(item.year), false, item.team);
    if (validationMessage) {
      invalidRows.push(index + 2);
    } else {
      const mainActivity = await MainActivitySchema.findById(mainActivityId).select("name");
      if (mainActivity) mainActivityNames.set(mainActivityId, mainActivity.name);
    }
  }
  if (invalidRows.length) {
    return {
      data: null,
      message: `CSV memiliki Kegiatan Utama atau tahun yang tidak valid pada baris: ${invalidRows.join(", ")}`,
      code: 400,
    };
  }

  const transformed = data.map((item: any) => {
    const { main: _legacyMain, mainActivityName: _label, ...csvItem } = item;
    const pok = {
      program: csvItem.program,
      activity: csvItem.activity,
      kro: csvItem.kro,
      ro: csvItem.ro,
      component: csvItem.component,
      subComponent: csvItem.subComponent,
      account: csvItem.account,
    };

    // remove POK-related flat fields
    const {
      mainActivityName: _ignoredLabel,
      main: _ignoredMain,
      program,
      activity,
      kro,
      ro,
      component,
      subComponent,
      account,
      ...rest
    } = csvItem;

    return {
      ...rest,
      mainActivityId: csvItem.mainActivityId,
      main: mainActivityNames.get(String(csvItem.mainActivityId)) ?? "",
      pok, // 👈 nested POK object
    };
  });

  const ops = transformed.map((item: any) => {
    if (item._id) {
      return {
        updateOne: {
          filter: { _id: item._id },
          update: { $set: item },
        },
      };
    } else {
      return {
        insertOne: { document: item },
      };
    }
  });

  // Execute all in bulk
  console.log("Running bulkWrite...");
  const result = await ActivitySchema.bulkWrite(ops);

  console.log("✅ BulkWrite finished!");
  console.log("Summary:");
  console.log({
    insertedCount: result.insertedCount,
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
    upsertedCount: result.upsertedCount,
  });

  // Friendly message
  console.log(`
✅ Inserted: ${result.insertedCount}
🔄 Updated: ${result.modifiedCount}
⚠️ No changes (same data or _id not found): ${
    data.length - (result.insertedCount + result.modifiedCount)
  }
`);

  // Optional: check for errors
  if (result.hasWriteErrors() && result.getWriteErrors().length > 0) {
    console.error("❌ Write errors:", result.getWriteErrors());
  }

  return {
    data: null,
    message: "Successfully created activities",
    code: 201,
  };
};

export const storeActivity = async (
  payload: Activity,
  claims: JWT,
): Promise<Result<Activity>> => {
  const validationMessage = await validateMainActivity(String(payload.mainActivityId ?? ""), Number(payload.year), false, payload.team);
  if (validationMessage) return { data: null, message: validationMessage, code: 400 };
  const mainActivity = await MainActivitySchema.findById(payload.mainActivityId);
  const activity = await ActivitySchema.create({ ...payload, main: mainActivity?.name ?? "" });

  return {
    data: activity,
    message: "Successfully created activity",
    code: 201,
  };
};

export const updateActivity = async (
  id: string,
  payload: Activity,
  claims: JWT,
): Promise<Result<Activity>> => {
  const existing = await ActivitySchema.findById(id);
  if (!existing) return { data: null, message: "Activity not found", code: 404 };
  const mainActivityId = payload.mainActivityId ?? String(existing.mainActivityId ?? "");
  const changingMainActivity = mainActivityId !== String(existing.mainActivityId ?? "");
  const retainingLegacyAssignment = !changingMainActivity && (payload.team === undefined || payload.team === existing.team);
  const validationMessage = await validateMainActivity(mainActivityId, Number(payload.year ?? existing.year), !changingMainActivity, payload.team ?? existing.team, retainingLegacyAssignment);
  if (validationMessage) return { data: null, message: validationMessage, code: 400 };
  const mainActivity = await MainActivitySchema.findById(mainActivityId);
  const activity = await ActivitySchema.findByIdAndUpdate(id, { ...payload, mainActivityId, main: mainActivity?.name ?? existing.main }, {
    new: true,
    runValidators: true,
  });

  return {
    data: activity,
    message: "Successfully updated activity",
    code: 200,
  };
};

export const deleteActivities = async (
  ids: string[] = [],
  claims: JWT,
): Promise<Result<any>> => {
  if (claims.team != "TU" && isProduction) {
    return {
      data: null,
      message: "Only IPDS & TU can delete an activities",
      code: 401,
    };
  }

  if (ids.length == 0) {
    return {
      data: null,
      message: "Please select activities",
      code: 400,
    };
  }

  await ActivitySchema.deleteMany({
    _id: { $in: ids },
  });

  return {
    data: null,
    message: "Successfully deleted activities",
    code: 200,
  };
};

export const deleteActivity = async (
  id: string,
  claims: JWT,
): Promise<Result<any>> => {
  if (claims.team != "TU" && isProduction) {
    return {
      data: null,
      message: "Only TU can update an activity",
      code: 401,
    };
  }

  await ActivitySchema.findByIdAndDelete(id);

  return {
    data: null,
    message: "Successfully deleted activity",
    code: 200,
  };
};

export const downloadActivities = async (
  ids: string[] = [],
): Promise<Result<any>> => {
  if (ids.length == 0) {
    return {
      data: null,
      message: "Please select activities",
      code: 400,
    };
  }

  const activities = await ActivitySchema.find({
    _id: { $in: ids },
  }).populate("mainActivityId", "name").select([
    "mainActivityId",
    "name",
    "code",
    "unit",
    "category",
    "team",
    "pok",
    "isSpecial",
    "year",
  ]);

  const transformedActivities = activities.map((item, index) => {
    const { pok, ...rest } = item.toObject();

    // Flatten POK if it exists
    const flatPOK = pok
      ? {
          program: pok.program || "",
          activity: pok.activity || "",
          kro: pok.kro || "",
          ro: pok.ro || "",
          component: pok.component || "",
          subComponent: pok.subComponent || "",
          account: pok.account || "",
        }
      : {
          program: "",
          activity: "",
          kro: "",
          ro: "",
          component: "",
          subComponent: "",
          account: "",
        };

    const activity = serializeActivity(item);
    return {
      ...rest,
      mainActivityId: String(activity.mainActivityId ?? ""),
      mainActivityName: activity.main,
      ...flatPOK, // 👈 flatten nested POK fields
    };
  });

  console.log(`Total records to download: ${transformedActivities.length}`);
  console.log("Transformed Activities:", transformedActivities);

  const file = convertToCsv(transformedActivities);

  return {
    data: file,
    message: "Successfully downloaded activities",
    code: 200,
  };
};
