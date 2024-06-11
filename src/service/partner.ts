import { Partner } from "@/model/partner";
import { Result } from "@/model/result";
import PartnerSchema from "@/schema/partner";

export const getPartners = async (): Promise<Result<Partner[]>> => {
  const partners = await PartnerSchema.find();

  return {
    data: partners,
    message: "Successfully retrieved partners",
    code: 200,
  };
};

export const getPartner = async (id: string): Promise<Result<Partner>> => {
  const partner = await PartnerSchema.findById(id);

  return {
    data: partner,
    message: "Successfully retrieved partner",
    code: 200,
  };
};

export const storePartner = async (
  payload: Partner
): Promise<Result<Partner>> => {
  const partner = await PartnerSchema.create(payload);

  return {
    data: partner,
    message: "Successfully created partner",
    code: 201,
  };
};

export const updatePartner = async (
  id: string,
  payload: Partner
): Promise<Result<Partner>> => {
  const partner = await PartnerSchema.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return {
    data: partner,
    message: "Successfully updated partner",
    code: 200,
  };
};

export const deletePartner = async (id: string): Promise<Result<any>> => {
  await PartnerSchema.findByIdAndDelete(id);

  return {
    data: null,
    message: "Successfully deleted partner",
    code: 204,
  };
};
