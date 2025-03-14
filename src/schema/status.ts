import { Status } from "@/model/status";
import { Schema, model } from "mongoose";

export const statusSchema = new Schema<Status>(
  {
    period: { type: String, required: true },
    contract: { type: Boolean, required: true, default: false },
    output: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  }
);

const StatusSchema = model("statuses", statusSchema);

export default StatusSchema;
