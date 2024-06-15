import { Activity } from "@/model/activity";
import { Schema, model } from "mongoose";

export const activitySchema = new Schema<Activity>(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const ActivitySchema = model("activities", activitySchema);

export default ActivitySchema;
