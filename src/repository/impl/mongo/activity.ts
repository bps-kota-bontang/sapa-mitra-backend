import { Activity } from "@/model/activity";
import { ActivityRepository } from "@/repository/activity";
import ActivitySchema from "@/schema/activity";

export const mongoActivityRepository = (): ActivityRepository => {
  const create = async (data: any): Promise<Activity> => {
    const activity = await ActivitySchema.create(data);

    return activity.toObject();
  };

  const findById = async (id: string): Promise<Activity | null> => {
    const activity = await ActivitySchema.findById(id);

    return activity?.toObject() ?? null;
  };

  const findManyById = async (ids: string[]): Promise<Activity[]> => {
    return (await ActivitySchema.find({ _id: { $in: ids } })).map((activity) =>
      activity.toObject()
    );
  };

  const findAll = async (queries: any = {}): Promise<Activity[]> => {
    return (await ActivitySchema.find(queries)).map((activity) =>
      activity.toObject()
    );
  };

  const update = async (id: string, data: any): Promise<Activity | null> => {
    const activity = await ActivitySchema.findByIdAndUpdate(id, data, {
      new: true,
    });
    return activity?.toObject() ?? null;
  };

  const deleteOne = async (id: string): Promise<void> => {
    await ActivitySchema.findByIdAndDelete(id);
  };

  const deleteMany = async (ids: string[]): Promise<void> => {
    await ActivitySchema.deleteMany({
      _id: { $in: ids },
    });
  };

  const createMany = async (data: any[]): Promise<Activity[]> => {
    const activities = await ActivitySchema.create(data);

    return activities.map((activity) => activity.toObject());
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
