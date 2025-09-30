import { Activity } from "@/model/activity";
import { Schema, model } from "mongoose";

export const activitySchema = new Schema<Activity>(
  {
    main: { type: String, required: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    unit: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["ENUMERATION", "SUPERVISION", "PROCESSING"],
    },
    team: {
      type: String,
      required: true,
      enum: ["SOSIAL", "PRODUKSI", "DISTRIBUSI", "NERWILIS", "IPDS", "TU"],
    },
    pok: {
      type: {
        program: { type: String, required: true },
        activity: { type: String, required: true },
        kro: { type: String, required: true },
        ro: { type: String, required: true },
        component: { type: String, required: true },
        subComponent: { type: String, required: true },
        account: { type: String, required: true },
      },
    },
    isSpecial: { type: Boolean, required: true, default: false },
    year: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const ActivitySchema = model("activities", activitySchema);

export default ActivitySchema;
