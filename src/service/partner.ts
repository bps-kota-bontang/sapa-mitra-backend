import { isProduction } from "@/common/utils";
import { JWT } from "@/model/jwt";
import { Partner } from "@/model/partner";
import { Result } from "@/model/result";
import PartnerSchema from "@/schema/partner";
import { parse } from "csv-parse/sync";

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
  if (!(claims.team == "IPDS" || claims.team == "TU") && isProduction) {
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

export const uploadPartner = async (
  file: File,
  claims: JWT
): Promise<Result<any>> => {
  if (!(claims.team == "IPDS" || claims.team == "TU") && isProduction) {
    return {
      data: null,
      message: "Only IPDS can update an partner",
      code: 401,
    };
  }

  if (!file) {
    return {
      data: null,
      message: "No file uploaded",
      code: 400,
    };
  }

  if (file.type != "text/csv") {
    return {
      data: null,
      message: "Only accepts csv file",
      code: 400,
    };
  }

  const fileContent = await file.text();

  const data = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  const outputs = await PartnerSchema.create(data);

  return {
    data: outputs,
    message: "Successfully added partners",
    code: 201,
  };
};

export const updatePartner = async (
  id: string,
  payload: Partner,
  claims: JWT
): Promise<Result<Partner>> => {
  if (!(claims.team == "IPDS" || claims.team == "TU") && isProduction) {
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

export const deletePartners = async (
  ids: string[] = [],
  claims: JWT
): Promise<Result<any>> => {
  if (!(claims.team == "IPDS" || claims.team == "TU") && isProduction) {
    return {
      data: null,
      message: "Only IPDS & TU can delete an partner",
      code: 401,
    };
  }

  if (ids.length == 0) {
    return {
      data: null,
      message: "Please select partners",
      code: 400,
    };
  }

  await PartnerSchema.deleteMany({
    _id: { $in: ids },
  });

  return {
    data: null,
    message: "Successfully deleted partners",
    code: 204,
  };
};

export const deletePartner = async (
  id: string,
  claims: JWT
): Promise<Result<any>> => {
  if (!(claims.team == "IPDS" || claims.team == "TU") && isProduction) {
    return {
      data: null,
      message: "Only IPDS & TU can delete an partner",
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
