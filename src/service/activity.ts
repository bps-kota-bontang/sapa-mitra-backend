import { convertToCsv, isProduction } from "@/common/utils";
import { Activity } from "@/model/activity";
import { JWT } from "@/model/jwt";
import { Result } from "@/model/result";
import ActivitySchema from "@/schema/activity";
import { parse } from "csv-parse/sync";

export const getActivities = async (
  year: string = "",
  claims: JWT
): Promise<Result<Activity[]>> => {
  let queries: any = {};

  if (claims.team != "TU") queries.team = claims.team;

  if (year) queries.year = year;

  const activities = await ActivitySchema.find(queries);

  const transformedActivities = activities.map((item, index) => {
    return {
      ...item.toObject(),
      index: index + 1,
    };
  });

  return {
    data: transformedActivities,
    message: "Successfully retrieved activities",
    code: 200,
  };
};

export const getActivity = async (id: string): Promise<Result<Activity>> => {
  const activity = await ActivitySchema.findById(id);

  return {
    data: activity,
    message: "Successfully retrieved activity",
    code: 200,
  };
};

export const uploadActivity = async (
  file: File,
  claims: JWT
): Promise<Result<any>> => {
  if (claims.team != "TU" && isProduction) {
    return {
      data: null,
      message: "Only TU can create an activity",
      code: 401,
    };
  }

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

  const transformed = data.map((item: any) => {
    const pok = {
      program: item.program,
      activity: item.activity,
      kro: item.kro,
      ro: item.ro,
      component: item.component,
      subComponent: item.subComponent,
      account: item.account,
    };

    // remove POK-related flat fields
    const {
      program,
      activity,
      kro,
      ro,
      component,
      subComponent,
      account,
      ...rest
    } = item;

    return {
      ...rest,
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
  claims: JWT
): Promise<Result<Activity>> => {
  if (claims.team != "TU" && isProduction) {
    return {
      data: null,
      message: "Only TU can create an activity",
      code: 401,
    };
  }
  const activity = await ActivitySchema.create(payload);

  return {
    data: activity,
    message: "Successfully created activity",
    code: 201,
  };
};

export const updateActivity = async (
  id: string,
  payload: Activity,
  claims: JWT
): Promise<Result<Activity>> => {
  const activity = await ActivitySchema.findByIdAndUpdate(id, payload, {
    new: true,
  });

  return {
    data: activity,
    message: "Successfully updated activity",
    code: 200,
  };
};

export const deleteActivities = async (
  ids: string[] = [],
  claims: JWT
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
    code: 204,
  };
};

export const deleteActivity = async (
  id: string,
  claims: JWT
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
    code: 204,
  };
};

export const downloadActivities = async (
  ids: string[] = []
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
  }).select([
    "main",
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

    return {
      ...rest,
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
