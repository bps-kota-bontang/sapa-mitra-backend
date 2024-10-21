import { Activity } from "@/model/activity";
import { ActivityRepository } from "@/repository/activity";
import ActivitySchema from "@/schema/activity";

export const mongoActivityRepository = (): ActivityRepository => {
  const create = async (activity: Activity): Promise<Activity> => {
    return await ActivitySchema.create(activity);
  };

  const findById = async (id: string): Promise<Activity | null> => {
    return await ActivitySchema.findById(id);
  };

  const findManyById = async (ids: string[]): Promise<Activity[]> => {
    return (await ActivitySchema.find({ _id: { $in: ids } })).map((activity) => {
      return activity.toObject();
    });
  }

  const findAll = async (queries: any = {}): Promise<Activity[]> => {
    return (await ActivitySchema.find(queries)).map((activity) => {
      return activity.toObject();
    });
  };

  const update = async (
    id: string,
    activity: Partial<Activity>
  ): Promise<Activity | null> => {
    return await ActivitySchema.findByIdAndUpdate(id, activity, { new: true });
  };

  const deleteOne = async (id: string): Promise<void> => {
    await ActivitySchema.findByIdAndDelete(id);
  };

  const deleteMany = async (ids: string[]): Promise<void> => {
    await ActivitySchema.deleteMany({
      _id: { $in: ids },
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
