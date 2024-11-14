import { User } from "@/model/user";
import { UserRepository } from "@/repository/user";
import UserSchema from "@/schema/user";

export const mongoUserRepository = (): UserRepository => {
  const findOne = async (): Promise<User | null> => {
    return await UserSchema.findOne();
  };

  return {
    findOne,
  };
};
