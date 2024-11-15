import { Partner } from "@/model/partner";
import { PartnerRepository } from "@/repository/partner";
import PartnerSchema from "@/schema/partner";

export const mongoPartnerRepository = (): PartnerRepository => {
  const findOne = async (queries?: any): Promise<Partner | null> => {
    const partner = await PartnerSchema.findOne({ queries });

    return partner?.toObject() ?? null;
  };

  const findAll = async (queries?: any): Promise<Partner[]> => {
    const partners = await PartnerSchema.find(queries);

    return partners.map((partner) => partner.toObject());
  };

  const create = async (data: any): Promise<Partner> => {
    const partner = await PartnerSchema.create(data);

    return partner.toObject();
  };
  const findById = async (id: string): Promise<Partner | null> => {
    const partner = await PartnerSchema.findById(id);

    return partner?.toObject() ?? null;
  };

  const findByIdAndUpdate = async (
    id: string,
    data: any
  ): Promise<Partner | null> => {
    const partner = await PartnerSchema.findByIdAndUpdate(id, data, {
      new: true,
    });

    return partner?.toObject() ?? null;
  };

  const createMany = async (data: any[]): Promise<Partner[]> => {
    const partners = await PartnerSchema.create(data);

    return partners.map((partner) => partner.toObject());
  };

  const deleteOne = async (id: string): Promise<void> => {
    await PartnerSchema.findByIdAndDelete(id);
  };

  const deleteMany = async (ids: string[]): Promise<void> => {
    await PartnerSchema.deleteMany({
      _id: { $in: ids },
    });
  };

  return {
    create,
    findOne,
    findAll,
    findById,
    findByIdAndUpdate,
    createMany,
    delete: deleteOne,
    deleteMany,
  };
};
