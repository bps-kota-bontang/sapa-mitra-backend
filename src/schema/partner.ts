import { Partner } from "@/model/partner";
import { Schema, model } from "mongoose";

export const partnerSchema = new Schema<Partner>(
  {
    name: { type: String, required: true },
    nik: {
      type: String,
      required: true,
      minlength: 16,
      maxlength: 16,
    },
    address: { type: String, required: true },
    year: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

partnerSchema.index({ nik: 1, year: 1 }, { unique: true });

const PartnerSchema = model("partners", partnerSchema);

export default PartnerSchema;
