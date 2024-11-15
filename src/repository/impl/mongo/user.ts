import { User } from "@/model/user";
import { UserRepository } from "@/repository/user";
import UserSchema from "@/schema/user";

export const mongoUserRepository = (): UserRepository => {
  const findOne = async (queries?: any): Promise<User | null> => {
    const user = await UserSchema.findOne({ queries });

    return user?.toObject() ?? null;
  };

  const findAll = async (queries?: any): Promise<User[]> => {
    const users = await UserSchema.find(queries);

    return users.map((user) => user.toObject());
  };

  const create = async (data: any): Promise<User> => {
    const user = await UserSchema.create(data);

    return user.toObject();
  };
  const findById = async (id: string): Promise<User | null> => {
    const user = await UserSchema.findById(id);

    return user?.toObject() ?? null;
  };

  const findByIdAndUpdate = async (
    id: string,
    data: any
  ): Promise<User | null> => {
    const user = await UserSchema.findByIdAndUpdate(id, data);

    return user?.toObject() ?? null;
  };

  return {
    create,
    findOne,
    findAll,
    findById,
    findByIdAndUpdate,
  };
};
