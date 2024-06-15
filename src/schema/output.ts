import { Output } from "@/model/output";
import { Schema, model } from "mongoose";

export const outputSchema = new Schema<Output>(
  {
    name: { type: String, required: true },
    unit: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const OutputSchema = model("outputs", outputSchema);

export default OutputSchema;
