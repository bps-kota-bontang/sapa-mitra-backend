import { isProduction } from "@/common/utils";
import { Output } from "@/model/output";
import { JWT } from "@/model/jwt";
import { Result } from "@/model/result";
import OutputSchema from "@/schema/output";

export const getOutputs = async (): Promise<Result<Output[]>> => {
  const outputs = await OutputSchema.find();

  return {
    data: outputs,
    message: "Successfully retrieved outputs",
    code: 200,
  };
};

export const getOutput = async (id: string): Promise<Result<Output>> => {
  const output = await OutputSchema.findById(id);

  return {
    data: output,
    message: "Successfully retrieved output",
    code: 200,
  };
};

export const storeOutput = async (
  payload: Output,
  claims: JWT
): Promise<Result<Output>> => {
  if (claims.team != "TU" && isProduction) {
    return {
      data: null,
      message: "Only TU can create an output",
      code: 401,
    };
  }
  
  const output = await OutputSchema.create(payload);

  return {
    data: output,
    message: "Successfully created output",
    code: 201,
  };
};

export const updateOutput = async (
  id: string,
  payload: Output,
  claims: JWT
): Promise<Result<Output>> => {
  if (claims.team != "TU" && isProduction) {
    return {
      data: null,
      message: "Only TU can update an output",
      code: 401,
    };
  }

  const output = await OutputSchema.findByIdAndUpdate(id, payload, {
    new: true,
  });

  return {
    data: output,
    message: "Successfully updated output",
    code: 200,
  };
};

export const deleteOutput = async (
  id: string,
  claims: JWT
): Promise<Result<any>> => {
  if (claims.team != "TU" && isProduction) {
    return {
      data: null,
      message: "Only TU can update an output",
      code: 401,
    };
  }

  await OutputSchema.findByIdAndDelete(id);

  return {
    data: null,
    message: "Successfully deleted output",
    code: 204,
  };
};
