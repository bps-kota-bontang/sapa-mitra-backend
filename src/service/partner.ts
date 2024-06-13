import { isProduction } from "@/common/utils";
import { JWT } from "@/model/jwt";
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
  payload: Partner,
  claims: JWT
): Promise<Result<Partner>> => {
  if (claims.team != "IPDS" && isProduction) {
    return {
      data: null,
      message: "Only IPDS can create an partner",
      code: 401,
    };
  }

  const partner = await PartnerSchema.create(payload);

  return {
    data: partner,
    message: "Successfully created partner",
    code: 201,
  };
};

export const updatePartner = async (
  id: string,
  payload: Partner,
  claims: JWT
): Promise<Result<Partner>> => {
  if (claims.team != "IPDS" && isProduction) {
    return {
      data: null,
      message: "Only IPDS can update an partner",
      code: 401,
    };
  }

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

export const deletePartner = async (
  id: string,
  claims: JWT
): Promise<Result<any>> => {
  if (claims.team != "IPDS" && isProduction) {
    return {
      data: null,
      message: "Only IPDS can delete an partner",
      code: 401,
    };
  }

  await PartnerSchema.findByIdAndDelete(id);

  return {
    data: null,
    message: "Successfully deleted partner",
    code: 204,
  };
};
