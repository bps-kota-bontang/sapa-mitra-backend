import { Output } from "@/model/output";
import { Schema, model } from "mongoose";

export const outputSchema = new Schema<Output>(
  {
    activity: {
      type: {
        name: { type: String, required: true },
      },
    },
    name: { type: String, required: true },
    unit: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const OutputSchema = model("outputs", outputSchema);

export default OutputSchema;
