import { transformModel } from "@/common/utils";
import prisma from "@/config/prisma";
import { Activity } from "@/model/activity";
import { ActivityRepository } from "@/repository/activity";

export const postgresActivityRepository = (): ActivityRepository => {
  const create = async (activity: Activity): Promise<Activity> => {
    const data = await prisma.activity.create({
      data: activity,
    });

    return transformModel(data) as Activity;
  };

  const findById = async (id: string): Promise<Activity | null> => {
    const data = await prisma.activity.findUnique({
      where: {
        id,
      },
    });

    return transformModel(data);
  };

  const findManyById = async (ids: string[]): Promise<Activity[]> => {
    const data = await prisma.activity.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return data.map((item) => transformModel(item) as Activity);
  };

  const findAll = async (queries: any = {}): Promise<Activity[]> => {
    const data = await prisma.activity.findMany({
      where: queries,
    });

    return data.map((item) => transformModel(item) as Activity);
  };

  const update = async (
    id: string,
    activity: Partial<Activity>
  ): Promise<Activity | null> => {
    const data = await prisma.activity.update({
      where: { id },
      data: activity,
    });

    return transformModel(data);
  };

  const deleteOne = async (id: string): Promise<void> => {
    await prisma.activity.delete({
      where: { id },
    });
  };

  const deleteMany = async (ids: string[]): Promise<void> => {
    await prisma.activity.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  };

  return {
    create,
    findById,
    findManyById,
    findAll,
    update,
    delete: deleteOne,
    deleteMany,
  };
};
