import { convertToCsv, isProduction } from "@/common/utils";
import { Activity } from "@/model/activity";
import { JWT } from "@/model/jwt";
import { Result } from "@/model/result";
import { ActivityRepository } from "@/repository/activity";
import { factoryRepository } from "@/repository/factory";
import { mongoActivityRepository } from "@/repository/impl/mongo/activity";
import { postgresActivityRepository } from "@/repository/impl/postgres/activity";
import { parse } from "csv-parse/sync";

const activityRepository: ActivityRepository = factoryRepository(
  mongoActivityRepository,
  postgresActivityRepository
);

export const getActivities = async (
  year: string = "",
  claims: JWT
): Promise<Result<Activity[]>> => {
  let queries: any = {};

  if (claims.team != "TU") queries.team = claims.team;

  if (year) queries.year = year;

  const activities = await activityRepository.findAll(queries);

  const transformedActivities = activities.map((item, index) => {
    return {
      ...item,
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
  const activity = await activityRepository.findById(id);

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

  const activities = await activityRepository.createMany(data);

  return {
    data: activities,
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
  const activity = await activityRepository.create(payload);

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
  if (claims.team != "TU" && isProduction) {
    return {
      data: null,
      message: "Only TU can update an activity",
      code: 401,
    };
  }

  const activity = await activityRepository.update(id, payload);

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

  await activityRepository.deleteMany(ids);

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

  await activityRepository.delete(id);

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

  const activities = await activityRepository.findManyById(ids);

  const file = convertToCsv(activities);

  return {
    data: file,
    message: "Successfully downloaded activities",
    code: 200,
  };
};
