import { Contract } from "@/model/contract";
import { Schema, model } from "mongoose";

export const contractSchema = new Schema<Contract>(
  {
    number: { type: String, required: true, unique: true },
    date: { type: String, required: true },
    partner: {
      type: {
        name: { type: String, required: true },
        address: { type: String, required: true },
      },
    },
    activities: [
      {
        type: {
          code: { type: String, required: true },
          name: { type: String, required: true },
          startDate: { type: Date, required: true },
          endDate: { type: Date, required: true },
          volume: { type: Number, required: true },
          unit: { type: String, required: true },
          rate: { type: Number, required: true },
          total: { type: Number, required: true },
        },
      },
    ],
    signDate: { type: Date, required: true },
    handoverDate: { type: Date, required: true },
    penalty: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const ContractSchema = model("contracts", contractSchema);

export default ContractSchema;
