import { isProduction } from "@/common/utils";
import { JWT } from "@/model/jwt";
import { Result } from "@/model/result";
import { Status } from "@/model/status";
import StatusSchema from "@/schema/status";

export const getStatuses = async (claims: JWT): Promise<Result<Status[]>> => {
  const statuses = await StatusSchema.find();

  const transformedStatuses = statuses.map((item, index) => {
    return {
      ...item.toObject(),
      index: index + 1,
    };
  });

  return {
    data: transformedStatuses,
    message: "Successfully retrieved status",
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
