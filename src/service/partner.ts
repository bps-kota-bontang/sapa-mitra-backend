import { convertToCsv, isProduction } from "@/common/utils";
import { JWT } from "@/model/jwt";
import { Partner } from "@/model/partner";
import { Result } from "@/model/result";
import { factoryRepository } from "@/repository/factory";
import { mongoPartnerRepository } from "@/repository/impl/mongo/partner";
import { postgresPartnerRepository } from "@/repository/impl/postgres/partner";
import { parse } from "csv-parse/sync";

const partnerRepository = factoryRepository(
  mongoPartnerRepository,
  postgresPartnerRepository
);

export const getPartners = async (
  year: string = ""
): Promise<Result<Partner[]>> => {
  let queries: any = {};

  if (year) queries.year = year;

  const partners = await partnerRepository.findAll(queries);

  const transformedPartners = partners.map((partner, index) => {
    return {
      ...partner,
      index: index + 1,
    };
  });

  return {
    data: transformedPartners,
    message: "Successfully retrieved partners",
    code: 200,
  };
};

export const getPartner = async (id: string): Promise<Result<Partner>> => {
  const partner = await partnerRepository.findById(id);

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

  const partner = await partnerRepository.create(payload);

  return {
    data: partner,
    message: "Successfully created partner",
    code: 201,
  };
};

export const downloadPartner = async (): Promise<Result<any>> => {
  const partners = await partnerRepository.findAll();

  const file = convertToCsv(partners);

  return {
    data: file,
    message: "Successfully downloaded partner",
    code: 200,
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
    delimiter: ";",
    skip_empty_lines: true,
  });

  const outputs = await partnerRepository.createMany(data);

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

  const partner = await partnerRepository.findByIdAndUpdate(id, payload);

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

  await partnerRepository.deleteMany(ids);

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

  await partnerRepository.delete(id);

  return {
    data: null,
    message: "Successfully deleted partner",
    code: 204,
  };
};
