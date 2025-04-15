import { Output } from "@/model/output";
import { Schema, model } from "mongoose";

export const outputSchema = new Schema<Output>(
  {
    activity: {
      type: {
        name: { type: String, required: true },
        team: {
          type: String,
          required: true,
          enum: ["SOSIAL", "PRODUKSI", "DISTRIBUSI", "NERWILIS", "IPDS", "TU"],
        },
      },
    },
    name: { type: String, required: true },
    unit: { type: String, required: true },
    year: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const OutputSchema = model("outputs", outputSchema);

export default OutputSchema;
