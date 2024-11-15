import { transformModel } from "@/common/utils";
import prisma from "@/config/prisma";
import { Output } from "@/model/output";
import { Activity } from "@/model/activity";
import { OutputRepository } from "@/repository/output";

export const postgresOutputRepository = (): OutputRepository => {
  const create = async (data: any): Promise<Output> => {
    const { activity, ...rest } = data;

    const payload = {
      ...rest,
      activityId: activity._id,
      year: parseInt(rest.year),
    };

    const output = await prisma.output.create({
      include: {
        activity: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      data: payload,
    });

    return transformModel({
      ...output,
      activity: transformModel(output.activity) as Pick<
        Activity,
        "_id" | "name"
      >,
    }) as Output;
  };

  const findById = async (id: string): Promise<Output | null> => {
    const output = await prisma.output.findUnique({
      where: {
        id,
      },
      include: {
        activity: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!output) return null;

    return transformModel({
      ...output,
      activity: transformModel(output.activity) as Pick<
        Activity,
        "_id" | "name"
      >,
    }) as Output;
  };

  const findManyById = async (ids: string[]): Promise<Output[]> => {
    const data = await prisma.output.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        activity: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return data.map(
      (item) =>
        transformModel({
          ...item,
          activity: transformModel(item.activity) as Pick<
            Activity,
            "_id" | "name"
          >,
        }) as Output
    );
  };

  const findAll = async (queries: any = {}): Promise<Output[]> => {
    if (queries._id) {
      queries.id = queries._id;
      delete queries._id;
    }

    const data = await prisma.output.findMany({
      where: queries,
      include: {
        activity: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const result = data.map((item) => {
      const output = transformModel({
        ...item,
        activity: transformModel(item.activity) as Pick<
          Activity,
          "_id" | "name"
        >,
      }) as Output;

      return output;
    });

    return result;
  };

  const update = async (id: string, data: any): Promise<Output | null> => {
    const output = await prisma.output.update({
      where: { id },
      include: {
        activity: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      data: {
        ...data,
        isSpecial: Boolean(data.isSpecial),
        year: parseInt(data.year),
      },
    });

    return transformModel({
      ...output,
      activity: transformModel(output.activity) as Pick<
        Activity,
        "_id" | "name"
      >,
    }) as Output;
  };

  const deleteOne = async (id: string): Promise<void> => {
    await prisma.output.delete({
      where: { id },
    });
  };

  const deleteMany = async (ids: string[]): Promise<void> => {
    await prisma.output.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  };

  const createMany = async (data: any[]): Promise<Output[]> => {
    const outputs = await prisma.output.createManyAndReturn({
      data: data.map((item) => {
        const { activity, ...rest } = item;

        const payload = {
          ...rest,
          activityId: activity._id,
          year: parseInt(item.year),
        };

        return payload;
      }),
      include: {
        activity: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return outputs.map(
      (item) =>
        transformModel({
          ...item,
          activity: transformModel(item.activity) as Pick<
            Activity,
            "_id" | "name"
          >,
        }) as Output
    );
  };

  const findByIdAndUpdate = async (
    id: string,
    data: any
  ): Promise<Output | null> => {
    const { activity, ...rest } = data;

    const payload = {
      ...rest,
      activityId: activity._id,
      year: parseInt(rest.year),
    };

    const output = await prisma.output.update({
      where: {
        id,
      },
      data: payload,
      include: {
        activity: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!output) return null;

    return transformModel({
      ...output,
      activity: transformModel(output.activity) as Pick<
        Activity,
        "_id" | "name"
      >,
    }) as Output;
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
    findByIdAndUpdate,
  };
};
