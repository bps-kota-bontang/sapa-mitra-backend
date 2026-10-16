import { MainActivity } from "@/model/mainActivity";
import { Schema, model } from "mongoose";

export const mainActivitySchema = new Schema<MainActivity>(
  {
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true, trim: true, lowercase: true },
    year: { type: Number, required: true },
    isActive: { type: Boolean, required: true, default: true },
    team: [{ type: String, enum: ["SOSIAL", "PRODUKSI", "DISTRIBUSI", "NERWILIS", "IPDS", "TU"] }],
  },
  { timestamps: true },
);

mainActivitySchema.index({ team: 1, year: 1, normalizedName: 1 }, { unique: true });

const MainActivitySchema = model("mainActivities", mainActivitySchema);

export default MainActivitySchema;