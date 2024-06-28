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

  const dataSorted = data.sort((a: User, b: User) => {
    const positionA = positionOrder[a.position] || Number.MAX_SAFE_INTEGER;
    const positionB = positionOrder[b.position] || Number.MAX_SAFE_INTEGER;

    if (positionA !== positionB) {
      return positionA - positionB;
    }

    if (!a.team && !b.team) return 0;
    if (!a.team) return -1;
    if (!b.team) return 1;

    if (a.team < b.team) return -1;
    if (a.team > b.team) return 1;

    return 0;
  });

  const outputs = await UserSchema.create(dataSorted);

  return {
    data: outputs,
    message: "Successfully uploaded users",
    code: 201,
  };
};
