import { Activity } from "@/model/activity";
import { Schema, model } from "mongoose";

export const activitySchema = new Schema<Activity>(
  {
    main: { type: String, required: false },
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
        program: { type: String, required: false },
        activity: { type: String, required: false },
        kro: { type: String, required: false },
        ro: { type: String, required: false },
        component: { type: String, required: false },
        subComponent: { type: String, required: false },
        account: { type: String, required: false },
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
