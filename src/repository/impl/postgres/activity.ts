import { transformModel } from "@/common/utils";
import prisma from "@/config/prisma";
import { Activity } from "@/model/activity";
import { ActivityRepository } from "@/repository/activity";

export const postgresActivityRepository = (): ActivityRepository => {
  const create = async (data: any): Promise<Activity> => {
    const activity = await prisma.activity.create({
      data: {
        ...data,
        isSpecial: Boolean(data.isSpecial),
        year: parseInt(data.year),
      },
    });

    return transformModel(activity) as Activity;
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

  const update = async (id: string, data: any): Promise<Activity | null> => {
    const activity = await prisma.activity.update({
      where: { id },
      data: {
        ...data,
        isSpecial: Boolean(data.isSpecial),
        year: parseInt(data.year),
      },
    });

    return transformModel(activity);
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

  const createMany = async (data: any[]): Promise<Activity[]> => {
    console.log(data);
    const activities = await prisma.activity.createManyAndReturn({
      data: data.map((item) => ({
        ...item,
        isSpecial: Boolean(item.isSpecial),
        year: parseInt(item.year),
      })),
    });

    return activities.map((item) => transformModel(item) as Activity);
  };

  return {
    create,
    findById,
    findManyById,
    findAll,
    update,
    delete: deleteOne,
    deleteMany,
    createMany,
  };
};
