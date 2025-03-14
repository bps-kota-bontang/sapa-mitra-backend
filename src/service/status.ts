import { generatePeriods, isProduction } from "@/common/utils";
import { JWT } from "@/model/jwt";
import { Result } from "@/model/result";
import { Status } from "@/model/status";
import StatusSchema from "@/schema/status";

export const getStatuses = async (claims: JWT): Promise<Result<Status[]>> => {
  // Ambil data status dari database
  const statuses = await StatusSchema.find();

  // Konversi data dari database ke objek dengan properti yang benar
  const existingStatuses = statuses.map((item) => item.toObject());

  // Generate daftar periode
  const periods = generatePeriods();

  // Gabungkan data dari database dengan periode yang dihasilkan
  const mergedStatuses = periods.map((period, index) => {
    const existingStatus = existingStatuses.find((s) => s.period === period);
    return existingStatus
      ? {
          period: period,
          contract: existingStatus.contract,
          output: existingStatus.output,
          index: index + 1,
        }
      : {
          period: period,
          contract: false,
          output: false,
          index: index + 1,
        };
  });

  return {
    data: mergedStatuses,
    message: "Successfully retrieved statuses",
    code: 200,
  };
};

export const getStatus = async (period: string): Promise<Result<Status>> => {
  const status = await StatusSchema.findOne({ period: period });

  return {
    data: status,
    message: "Successfully retrieved status",
    code: 200,
  };
};

export const updateStatusContract = async (
  period: string,
  statusContract: boolean,
  claims: JWT
): Promise<Result<any>> => {
  if (claims.team != "TU" && isProduction) {
    return {
      data: null,
      message: "You are not authorized to change contract status",
      code: 401,
    };
  }

  const status = await StatusSchema.findOneAndUpdate(
    {
      period: period,
    },
    {
      contract: statusContract,
    },
    { upsert: true, new: true }
  );

  if (!status) {
    return {
      data: null,
      message: "Failed to change contract status",
      code: 400,
    };
  }

  return {
    data: null,
    message: "Successfully changed contract status",
    code: 200,
  };
};

export const updateStatusOutput = async (
  period: string,
  statusOutput: boolean,
  claims: JWT
): Promise<Result<any>> => {
  if (claims.team != "TU" && isProduction) {
    return {
      data: null,
      message: "You are not authorized to change output status",
      code: 401,
    };
  }

  const status = await StatusSchema.findOneAndUpdate(
    {
      period: period,
    },
    {
      output: statusOutput,
    },
    { upsert: true, new: true }
  );

  if (!status) {
    return {
      data: null,
      message: "Failed to change output status",
      code: 400,
    };
  }

  return {
    data: null,
    message: "Successfully changed output status",
    code: 200,
  };
};
