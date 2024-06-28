import { Activity } from "@/model/activity";
import { Schema, model } from "mongoose";

export const activitySchema = new Schema<Activity>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    team: {
      type: String,
      required: true,
      enum: ["SOSIAL", "PRODUKSI", "DISTRIBUSI", "NERWILIS", "IPDS", "TU"],
    },
  },
  {
    timestamps: true,
  }
);

const ActivitySchema = model("activities", activitySchema);

export default ActivitySchema;
