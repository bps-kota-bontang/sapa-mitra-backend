import { isProduction } from "@/common/utils";
import { Output } from "@/model/output";
import { Result } from "@/model/result";
import OutputSchema from "@/schema/output";
import { parse } from "csv-parse/sync";

export const getOutputs = async (): Promise<Result<Output[]>> => {
  const outputs = await OutputSchema.find();

  const transformedOutputs = outputs.map((item, index) => {
    return {
      ...item.toObject(),
      index: index + 1,
    };
  });

  return {
    data: transformedOutputs,
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
  payload: Output
): Promise<Result<Output>> => {
  const output = await OutputSchema.create(payload);

  return {
    data: output,
    message: "Successfully created output",
    code: 201,
  };
};

export const uploadOutput = async (
  file: File
): Promise<Result<any>> => {
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

  const outputs = await OutputSchema.create(data);

  return {
    data: outputs,
    message: "Successfully created output",
    code: 201,
  };
};

export const updateOutput = async (
  id: string,
  payload: Output
): Promise<Result<Output>> => {
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
  id: string
): Promise<Result<any>> => {
  await OutputSchema.findByIdAndDelete(id);

  return {
    data: null,
    message: "Successfully deleted output",
    code: 204,
  };
};

export const deleteOutputs = async (
  ids: string[] = []
): Promise<Result<any>> => {
  if (ids.length == 0) {
    return {
      data: null,
      message: "Please select outputs",
      code: 400,
    };
  }

  await OutputSchema.deleteMany({
    _id: { $in: ids },
  });

  return {
    data: null,
    message: "Successfully deleted outputs",
    code: 204,
  };
};
