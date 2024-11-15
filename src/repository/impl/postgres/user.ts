import { transformModel } from "@/common/utils";
import prisma from "@/config/prisma";
import { User } from "@/model/user";
import { UserRepository } from "@/repository/user";

export const postgresUserRepository = (): UserRepository => {
  const findOne = async (queries?: any): Promise<User | null> => {
    const user = await prisma.user.findFirst({
      where: queries,
    });

    return transformModel(user);
  };

  const findAll = async (queries?: any): Promise<User[]> => {
    const users = await prisma.user.findMany({
      where: queries,
    });

    return users.map((item) => transformModel(item) as User);
  };

  const create = async (data: any): Promise<User> => {
    const user = await prisma.user.create({
      data: data,
    });

    return transformModel(user) as User;
  };

  const findById = async (id: string): Promise<User | null> => {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    return transformModel(user);
  };

  const findByIdAndUpdate = async (
    id: string,
    data: any
  ): Promise<User | null> => {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data: data,
    });

    return transformModel(user);
  };

  return {
    findOne,
    findAll,
    create,
    findById,
    findByIdAndUpdate,
  };
};