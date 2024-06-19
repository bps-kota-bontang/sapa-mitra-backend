import { Configuration } from "@/model/configuration";
import { JWT } from "@/model/jwt";
import { Result } from "@/model/result";
import ConfigurationSchema from "@/schema/configuration";

export const getConfigurations = async (): Promise<
  Result<Configuration<any>[]>
> => {
  const configurations = await ConfigurationSchema.find();

  return {
    data: configurations,
    message: "Successfully retrieved configurations",
    code: 200,
  };
};

export const getConfiguration = async (
  name: string
): Promise<Result<Configuration<any>>> => {
  const configuration = await ConfigurationSchema.findOne({ name: name });

  return {
    data: configuration,
    message: "Successfully retrieved configuration",
    code: 200,
  };
};

export const storeConfiguration = async (
  payload: Configuration<any>,
  claims: JWT
): Promise<Result<Configuration<any>>> => {
  if (claims.team == "TU") {
    return {
      data: null,
      message: "Configuration can only be updated by the TU team",
      code: 400,
    };
  }

  let value;

  if (payload.name === "AUTHORITY") {
    value =
      payload.value.name && payload.value.address
        ? {
          name: payload.value.name,
          nip: payload.value.nip,
          address: payload.value.address,
        }
        : null;
  } else if (payload.name === "REGION") {
    value = typeof payload.value === "string" ? payload.value : null;
  }

  if (!value) {
    return {
      data: null,
      message: "Invalid payload",
      code: 400,
    };
  }

  const configuration = await ConfigurationSchema.create({
    name: payload.name,
    value: value,
  });

  return {
    data: configuration,
    message: "Successfully created configuration",
    code: 201,
  };
};

export const updateConfiguration = async (
  name: string,
  payload: Configuration<any>,
  claims: JWT
): Promise<Result<Configuration<any>>> => {
  if (claims.team == "TU") {
    return {
      data: null,
      message: "Configuration can only be updated by the TU team",
      code: 400,
    };
  }

  let value;

  if (name === "AUTHORITY") {
    value =
      payload.value.name && payload.value.address
        ? {
          name: payload.value.name,
          nip: payload.value.nip,
          address: payload.value.address,
        }
        : null;
  } else if (name === "REGION") {
    value = typeof payload.value === "string" ? payload.value : null;
  }

  if (!value) {
    return {
      data: null,
      message: "Invalid payload",
      code: 400,
    };
  }

  const configuration = await ConfigurationSchema.findOneAndUpdate(
    { name: name },
    { value: value },
    {
      new: true,
      runValidators: true,
      upsert: true
    }
  );

  return {
    data: configuration,
    message: "Successfully updated configuration",
    code: 200,
  };
};

export const deleteConfiguration = async (
  name: string,
  claims: JWT
): Promise<Result<any>> => {
  if (claims.team == "TU") {
    return {
      data: null,
      message: "Configuration can only be updated by the TU team",
      code: 400,
    };
  }

  await ConfigurationSchema.findOneAndDelete({ name: name });

  return {
    data: null,
    message: "Successfully deleted configuration",
    code: 204,
  };
};
