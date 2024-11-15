import { Activity } from "@/model/activity";
import { Document } from "mongoose";

export type Output = {
  _id: string;
  activity: Pick<Activity, "name" | "_id">;
  name: string;
  unit: string;
  year: number;
};

export type OutputPayload = {
  activity: {
    activityId: string;
  };
  name: string;
  unit: string;
  year: number;
};
