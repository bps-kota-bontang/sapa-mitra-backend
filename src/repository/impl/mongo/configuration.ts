import { Configuration } from "@/model/configuration";
import { ConfigurationRepository } from "@/repository/configuration";
import ConfigurationSchema from "@/schema/configuration";

export const mongoConfigurationRepository = (): ConfigurationRepository => {
  const findOne = async (queries?: any): Promise<Configuration<any> | null> => {
    const configuration = await ConfigurationSchema.findOne({ queries });

    return configuration?.toObject() ?? null;
  };

  const findAll = async (queries?: any): Promise<Configuration<any>[]> => {
    const configurations = await ConfigurationSchema.find(queries);

    return configurations.map((configuration) => configuration.toObject());
  };

  const create = async (data: any): Promise<Configuration<any>> => {
    const configuration = await ConfigurationSchema.create(data);

    return configuration.toObject();
  };
  const findById = async (id: string): Promise<Configuration<any> | null> => {
    const configuration = await ConfigurationSchema.findById(id);

    return configuration?.toObject() ?? null;
  };

  const findByIdAndUpdate = async (
    id: string,
    data: any
  ): Promise<Configuration<any> | null> => {
    const configuration = await ConfigurationSchema.findByIdAndUpdate(id, data);

    return configuration?.toObject() ?? null;
  };

  const createMany = async (data: any[]): Promise<Configuration<any>[]> => {
    const configurations = await ConfigurationSchema.create(data);

    return configurations.map((configuration) => configuration.toObject());
  };

  const findOneAndUpdate = async (
    queries: any,
    data: any
  ): Promise<Configuration<any> | null> => {
    const configuration = await ConfigurationSchema.findOneAndUpdate(
      queries,
      data,
      {
        new: true,
        runValidators: true,
        upsert: true,
      }
    );

    return configuration?.toObject() ?? null;
  };

  const findOneAndDelete = async (queries: any): Promise<void> => {
    await ConfigurationSchema.findOneAndDelete(queries);
  };

  return {
    create,
    findOne,
    findAll,
    findById,
    findByIdAndUpdate,
    createMany,
    findOneAndUpdate,
    findOneAndDelete,
  };
};
