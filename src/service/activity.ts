import { Activity } from "@/model/activity";
import { JWT } from "@/model/jwt";
import { Result } from "@/model/result";
import ActivitySchema from "@/schema/activity";

export const getActivities = async (): Promise<Result<Activity[]>> => {
  const activities = await ActivitySchema.find();

  return {
    data: activities,
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

export const storeActivity = async (
  payload: Activity,
  claims: JWT
): Promise<Result<Activity>> => {
  if (claims.team != "TU") {
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
  if (claims.team != "TU") {
    return {
      data: null,
      message: "Only TU can update an activity",
      code: 401,
    };
  }

  const activity = await ActivitySchema.findByIdAndUpdate(id, payload, {
    new: true,
  });

  return {
    data: activity,
    message: "Successfully updated activity",
    code: 200,
  };
};

export const deleteActivity = async (
  id: string,
  claims: JWT
): Promise<Result<any>> => {
  if (claims.team != "TU") {
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
