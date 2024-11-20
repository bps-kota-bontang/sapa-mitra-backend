import { transformModel } from "@/common/utils";
import prisma from "@/config/prisma";
import { Configuration } from "@/model/configuration";
import { ConfigurationRepository } from "@/repository/configuration";

export const postgresConfigurationRepository = (): ConfigurationRepository => {
  const findOne = async (
    queries: any = {}
  ): Promise<Configuration<any> | null> => {
    if (queries._id) {
      queries.id = queries._id;
      delete queries._id;
    }

    const configuration = await prisma.configuration.findFirst({
      where: queries,
    });

    return transformModel(configuration);
  };

  const findAll = async (queries: any = {}): Promise<Configuration<any>[]> => {
    if (queries._id) {
      queries.id = queries._id;
      delete queries._id;
    }

    const configurations = await prisma.configuration.findMany({
      where: queries,
    });

    return configurations.map(
      (item) => transformModel(item) as Configuration<any>
    );
  };

  const create = async (data: any): Promise<Configuration<any>> => {
    const configuration = await prisma.configuration.create({
      data: data,
    });

    return transformModel(configuration) as Configuration<any>;
  };

  const findById = async (id: string): Promise<Configuration<any> | null> => {
    const configuration = await prisma.configuration.findUnique({
      where: {
        id,
      },
    });

    return transformModel(configuration);
  };

  const findByIdAndUpdate = async (
    id: string,
    data: any
  ): Promise<Configuration<any> | null> => {
    const configuration = await prisma.configuration.update({
      where: {
        id,
      },
      data: data,
    });

    return transformModel(configuration);
  };

  const createMany = async (data: any[]): Promise<Configuration<any>[]> => {
    const configurations = await prisma.configuration.createManyAndReturn({
      data: data.map((item) => ({
        ...item,
        year: parseInt(item.year),
      })),
    });

    return configurations.map(
      (item) => transformModel(item) as Configuration<any>
    );
  };

  const findOneAndUpdate = async (
    queries: any,
    data: any
  ): Promise<Configuration<any> | null> => {
    const configuration = await prisma.configuration.upsert({
      where: queries,
      create: {
        ...data,
        name: queries.name,
      },
      update: data,
    });

    return transformModel(configuration);
  };

  const findOneAndDelete = async (queries: any): Promise<void> => {
    await prisma.configuration.delete({
      where: queries,
    });
  };

  return {
    findOne,
    findAll,
    create,
    findById,
    findByIdAndUpdate,
    createMany,
    findOneAndUpdate,
    findOneAndDelete,
  };
};
