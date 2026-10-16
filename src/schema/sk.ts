import { SK } from "@/model/sk";
import { Schema, model } from "mongoose";

const skSchema = new Schema<SK>(
  {
    number: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    mainActivityId: { type: String, required: true, index: true },
    mainActivityName: { type: String, required: true },
    year: { type: Number, required: true },
    team: [{ type: String, enum: ["SOSIAL", "PRODUKSI", "DISTRIBUSI", "NERWILIS", "IPDS", "TU"] }],
    staff: [
      {
        source: { type: String, required: true, enum: ["PARTNER", "MANUAL"] },
        partnerNik: { type: String, required: false },
        activityId: { type: String, required: false },
        activityName: { type: String, required: false },
        activityCode: { type: String, required: false },
        name: { type: String, required: true, trim: true },
        position: { type: String, required: true, enum: ["PENDATAAN", "PEMERIKSAAN", "PENGOLAHAN"] },
        title: { type: String, required: true, trim: true },
        honorRate: { type: Number, required: false, default: null, min: 0 },
      },
    ],
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

skSchema.index({ number: 1, team: 1 }, { unique: true });

const SKSchema = model("skDocuments", skSchema);
export default SKSchema;
