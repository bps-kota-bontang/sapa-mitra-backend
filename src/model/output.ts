import { Activity } from "@/model/activity";

export type Output = {
  activity: Pick<Activity, "name">;
  name: string;
  unit: string;
};

export type OutputPayload = {
  activity: {
    activityId: string;
  };
  name: string;
  unit: string;
};
