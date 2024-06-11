import { JWT } from "@/model/jwt";
import { Result } from "@/model/result";
import { User } from "@/model/user";
import UserSchema from "@/schema/user";

export const getUsers = async (claims: JWT): Promise<Result<User[]>> => {
  const users = await UserSchema.find().select(["-password"]);

  return {
    data: users,
    message: "Successfully retrieved user",
    code: 200,
  };
};
