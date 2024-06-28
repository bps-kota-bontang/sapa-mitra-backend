import { isProduction, positionOrder } from "@/common/utils";
import { JWT } from "@/model/jwt";
import { Result } from "@/model/result";
import { User } from "@/model/user";
import UserSchema from "@/schema/user";
import { parse } from "csv-parse/sync";

export const getUsers = async (claims: JWT): Promise<Result<User[]>> => {
  const users = await UserSchema.find().select(["-password"]);

  const transformedUsers = users.map((item, index) => {
    return {
      ...item.toObject(),
      index: index + 1,
    };
  });

  return {
    data: transformedUsers,
    message: "Successfully retrieved user",
    code: 200,
  };
};

export const getUser = async (id: string): Promise<Result<User>> => {
  const user = await UserSchema.findOne({ _id: id }).select(["-password"]);

  return {
    data: user,
    message: "Successfully retrieved user",
    code: 200,
  };
};

export const uploadUsers = async (
  file: File,
  claims: JWT
): Promise<Result<any>> => {
  if (!(claims.team == "IPDS" || claims.team == "TU") && isProduction) {
    return {
      data: null,
      message: "Only IPDS can update an user",
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
    cast: (value) => (value === "" ? null : value),
  });

  const outputs = await UserSchema.create(data);

  return {
    data: outputs,
    message: "Successfully uploaded users",
    code: 201,
  };
};
