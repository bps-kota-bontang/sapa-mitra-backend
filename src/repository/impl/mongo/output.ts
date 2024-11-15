import { Output } from "@/model/output";
import { OutputRepository } from "@/repository/output";
import OutputSchema from "@/schema/output";

export const mongoOutputRepository = (): OutputRepository => {
  const create = async (data: any): Promise<Output> => {
    const output = await OutputSchema.create(data);

    return output.toObject();
  };

  const findById = async (id: string): Promise<Output | null> => {
    const output = await OutputSchema.findById(id);

    return output?.toObject() ?? null;
  };

  const findManyById = async (ids: string[]): Promise<Output[]> => {
    return (await OutputSchema.find({ _id: { $in: ids } })).map((output) =>
      output.toObject()
    );
  };

  const findAll = async (queries: any = {}): Promise<Output[]> => {
    return (await OutputSchema.find(queries)).map((output) =>
      output.toObject()
    );
  };

  const update = async (id: string, data: any): Promise<Output | null> => {
    const output = await OutputSchema.findByIdAndUpdate(id, data, {
      new: true,
    });
    return output?.toObject() ?? null;
  };

  const deleteOne = async (id: string): Promise<void> => {
    await OutputSchema.findByIdAndDelete(id);
  };

  const deleteMany = async (ids: string[]): Promise<void> => {
    await OutputSchema.deleteMany({
      _id: { $in: ids },
    });
  };

  const createMany = async (data: any[]): Promise<Output[]> => {
    const activities = await OutputSchema.create(data);

    return activities.map((output) => output.toObject());
  };

  const findByIdAndUpdate = async (
    id: string,
    data: any
  ): Promise<Output | null> => {
    const output = await OutputSchema.findByIdAndUpdate(id, data, {
      new: true,
    });

    return output?.toObject() ?? null;
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
