import { transformModel } from "@/common/utils";
import prisma from "@/config/prisma";
import { Partner } from "@/model/partner";
import { PartnerRepository } from "@/repository/partner";

export const postgresPartnerRepository = (): PartnerRepository => {
  const findOne = async (queries: any = {}): Promise<Partner | null> => {
    if (queries._id) {
      queries.id = queries._id;
      delete queries._id;
    }

    const partner = await prisma.partner.findFirst({
      where: queries,
    });

    return transformModel(partner);
  };

  const findAll = async (queries: any = {}): Promise<Partner[]> => {
    if (queries._id) {
      queries.id = queries._id;
      delete queries._id;
    }

    const partners = await prisma.partner.findMany({
      where: queries,
    });

    return partners.map((item) => transformModel(item) as Partner);
  };

  const create = async (data: any): Promise<Partner> => {
    const partner = await prisma.partner.create({
      data: {
        ...data,
        year: parseInt(data.year),
      },
    });

    return transformModel(partner) as Partner;
  };

  const findById = async (id: string): Promise<Partner | null> => {
    const partner = await prisma.partner.findUnique({
      where: {
        id,
      },
    });

    return transformModel(partner);
  };

  const findByIdAndUpdate = async (
    id: string,
    data: any
  ): Promise<Partner | null> => {
    const partner = await prisma.partner.update({
      where: {
        id,
      },
      data: {
        ...data,
        year: parseInt(data.year),
      },
    });

    return transformModel(partner);
  };

  const createMany = async (data: any[]): Promise<Partner[]> => {
    const partners = await prisma.partner.createManyAndReturn({
      data: data.map((item) => ({
        ...item,
        year: parseInt(item.year),
      })),
    });

    return partners.map((item) => transformModel(item) as Partner);
  };

  const deleteOne = async (id: string): Promise<void> => {
    await prisma.partner.delete({
      where: { id },
    });
  };

  const deleteMany = async (ids: string[]): Promise<void> => {
    await prisma.partner.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  };

  return {
    findOne,
    findAll,
    create,
    findById,
    findByIdAndUpdate,
    createMany,
    delete: deleteOne,
    deleteMany,
  };
};
