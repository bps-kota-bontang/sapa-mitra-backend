import { Activity } from "@/model/activity";
import { Document } from "mongoose";

export type Output = {
  activity: Pick<Activity, "name"> & Document;
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
