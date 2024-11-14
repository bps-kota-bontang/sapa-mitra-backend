import { transformModel } from "@/common/utils";
import prisma from "@/config/prisma";
import { User } from "@/model/user";
import { UserRepository } from "@/repository/user";

export const postgresUserRepository = (): UserRepository => {
  const findOne = async (): Promise<User | null> => {
    const data = await prisma.user.findFirst();

    return transformModel(data);
  };

  return {
    findOne,
  };
};
