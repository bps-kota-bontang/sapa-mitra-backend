import { isProduction, positionOrder } from "@/common/utils";
import { JWT } from "@/model/jwt";
import { Result } from "@/model/result";
import { UpdatePasswordPayload, User, UserPayload } from "@/model/user";
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

const canManageUsers = (claims: JWT) =>
  claims.team == "IPDS" || claims.team == "TU" || !isProduction;

const duplicateMessage = (e: any) => {
  if (e?.code !== 11000) return null;
  return "email" in (e.keyPattern ?? {}) ? "Email sudah digunakan" : "NIP sudah digunakan";
};

export const createUser = async (
  payload: UserPayload,
  claims: JWT
): Promise<Result<any>> => {
  if (!canManageUsers(claims)) {
    return { data: null, message: "Only IPDS or TU can create an user", code: 401 };
  }

  if (!payload.password) {
    return { data: null, message: "Password is required", code: 400 };
  }

  try {
    const user = await UserSchema.create({
      name: payload.name,
      nip: payload.nip,
      email: payload.email?.trim(),
      team: payload.team || undefined,
      position: payload.position,
      password: await Bun.password.hash(payload.password, { algorithm: "bcrypt" }),
    });

    const { password, ...data } = user.toObject();

    return { data, message: "Successfully created user", code: 201 };
  } catch (e: any) {
    const message = duplicateMessage(e);
    if (message) return { data: null, message, code: 409 };
    throw e;
  }
};

export const updateUser = async (
  id: string,
  payload: UserPayload,
  claims: JWT
): Promise<Result<any>> => {
  if (!canManageUsers(claims)) {
    return { data: null, message: "Only IPDS or TU can update an user", code: 401 };
  }

  const update: any = {
    name: payload.name,
    nip: payload.nip,
    email: payload.email?.trim(),
    team: payload.team || null,
    position: payload.position,
  };

  if (payload.password) {
    update.password = await Bun.password.hash(payload.password, {
      algorithm: "bcrypt",
    });
  }

  try {
    const user = await UserSchema.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).select(["-password"]);

    if (!user) {
      return { data: null, message: "User not found", code: 404 };
    }

    return { data: user, message: "Successfully updated user", code: 200 };
  } catch (e: any) {
    const message = duplicateMessage(e);
    if (message) return { data: null, message, code: 409 };
    throw e;
  }
};

export const deleteUser = async (
  id: string,
  claims: JWT
): Promise<Result<any>> => {
  if (!canManageUsers(claims)) {
    return { data: null, message: "Only IPDS or TU can delete an user", code: 401 };
  }

  if (claims.sub == id) {
    return { data: null, message: "Tidak dapat menghapus akun sendiri", code: 400 };
  }

  const user = await UserSchema.findByIdAndDelete(id);

  if (!user) {
    return { data: null, message: "User not found", code: 404 };
  }

  return { data: null, message: "Successfully deleted user", code: 200 };
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

  const hashedData = await Promise.all(
    data.map(async (user: any) => {
      if (user.password) {
        user.password = await Bun.password.hash(user.password, {
          algorithm: "bcrypt",
        });
      }
      return user;
    })
  );

  const outputs = await UserSchema.create(hashedData);

  return {
    data: outputs,
    message: "Successfully uploaded users",
    code: 201,
  };
};

export const updatePassword = async (
  id: string,
  payload: UpdatePasswordPayload,
  claims: JWT
): Promise<Result<any>> => {
  const user = await UserSchema.findById(id);

  if (!user) {
    return {
      data: null,
      message: "User not found",
      code: 404,
    };
  }

  if (claims.sub != id) {
    return {
      data: null,
      message:
        "Unauthorized access. You do not have permission to update this user's password.",
      code: 401,
    };
  }

  const { password: hashedPassword, ...restUser } = user.toObject(); // Convert the document to a plain object

  const isMatch = await Bun.password.verify(
    payload.oldPassword,
    hashedPassword
  );

  if (!isMatch) {
    return {
      data: null,
      message: "Invalid credential",
      code: 400,
    };
  }

  const hashedNewPassword = await Bun.password.hash(payload.newPassword, {
    algorithm: "bcrypt",
  });

  const result = await UserSchema.findByIdAndUpdate(id, {
    password: hashedNewPassword,
  });

  if (!result) {
    return {
      data: null,
      message: "Failed to update password",
      code: 404,
    };
  }

  return {
    data: null,
    message: "Successfully changed password user",
    code: 200,
  };
};
