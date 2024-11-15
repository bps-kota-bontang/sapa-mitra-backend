import { convertToCsv } from "@/common/utils";
import { JWT } from "@/model/jwt";
import { Output, OutputPayload } from "@/model/output";
import { Result } from "@/model/result";
import { factoryRepository } from "@/repository/factory";
import { mongoActivityRepository } from "@/repository/impl/mongo/activity";
import { mongoOutputRepository } from "@/repository/impl/mongo/output";
import { postgresActivityRepository } from "@/repository/impl/postgres/activity";
import { postgresOutputRepository } from "@/repository/impl/postgres/output";
import { parse } from "csv-parse/sync";

const activityrepository = factoryRepository(
  mongoActivityRepository,
  postgresActivityRepository
);

const outputRepository = factoryRepository(
  mongoOutputRepository,
  postgresOutputRepository
);

export const getOutputs = async (
  year: string = "",
  claims: JWT
): Promise<Result<Output[]>> => {
  let queries: any = {};

  if (year) queries.year = year;

  const outputs = await outputRepository.findAll(queries);

  const filterOutputs = (
    await Promise.all(
      outputs.map(async (item) => {
        const activities = await activityrepository.findAll({
          _id: item.activity._id,
          ...(claims.team !== "TU" ? { team: claims.team } : {}),
        });

        if (!activities.length) return null;

        return item;
      })
    )
  ).filter((output) => output !== null);

  const transformedOutputs = filterOutputs.map((item, index) => {
    return {
      ...item,
      index: index + 1,
    };
  });

  return {
    data: transformedOutputs,
    message: "Successfully retrieved outputs",
    code: 200,
  };
};

export const getOutput = async (id: string): Promise<Result<Output>> => {
  const output = await outputRepository.findById(id);

  return {
    data: output,
    message: "Successfully retrieved output",
    code: 200,
  };
};

export const storeOutput = async (
  payload: OutputPayload
): Promise<Result<Output>> => {
  const { activity: payloadActivity, ...restPayload } = payload;
  const activity = await activityrepository.findById(
    payloadActivity.activityId
  );

  if (!activity) {
    return {
      data: null,
      message: "Activity not found",
      code: 404,
    };
  }

  const output = await outputRepository.create({
    activity: {
      _id: activity._id,
      name: activity.name,
    },
    ...restPayload,
  });

  return {
    data: output,
    message: "Successfully created output",
    code: 201,
  };
};

///TODO: Implement uploadOutput

export const uploadOutput = async (file: File): Promise<Result<any>> => {
  if (!file) {
    return {
      data: null,
      message: "No file uploaded",
      code: 400,
    };
  }

  if (file.type != "text/csv") {
    return {
      data: null,
      message: "Only accepts csv file",
      code: 400,
    };
  }

  const fileContent = await file.text();

  const data = parse(fileContent, {
    columns: true,
    delimiter: ";",
    skip_empty_lines: true,
  });

  const activityIds = data.map((item: any) => item.activityId);

  const activities = await activityrepository.findManyById(activityIds);

  const activitiesName = activities.map((item) => {
    return {
      _id: item._id,
      name: item.name,
    };
  });

  const activityMap = new Map<string, any>();
  activitiesName.forEach((activity) => {
    activityMap.set(activity._id.toString(), activity);
  });

  const transformedData = data.map((item: any) => {
    const { activityId, ...restPayload } = item;

    const activity = activityMap.get(item.activityId);

    if (!activity) {
      return {
        data: null,
        message: `Activity with ID ${item.activityId} not found`,
        code: 400,
      };
    }

    return {
      ...restPayload,
      activity: {
        ...activity,
      },
    };
  });

  const outputs = await outputRepository.createMany(transformedData);

  return {
    data: outputs,
    message: "Successfully created output",
    code: 201,
  };
};

export const updateOutput = async (
  id: string,
  payload: OutputPayload
): Promise<Result<Output>> => {
  const { activity: payloadActivity, ...restPayload } = payload;
  const activity = await activityrepository.findById(
    payloadActivity.activityId
  );

  if (!activity) {
    return {
      data: null,
      message: "Activity not found",
      code: 404,
    };
  }

  const output = await outputRepository.findByIdAndUpdate(id, {
    activity: {
      _id: activity._id,
      name: activity.name,
    },
    ...restPayload,
  });

  return {
    data: output,
    message: "Successfully updated output",
    code: 200,
  };
};

export const deleteOutput = async (id: string): Promise<Result<any>> => {
  await outputRepository.delete(id);

  return {
    data: null,
    message: "Successfully deleted output",
    code: 204,
  };
};

export const deleteOutputs = async (
  ids: string[] = []
): Promise<Result<any>> => {
  if (ids.length == 0) {
    return {
      data: null,
      message: "Please select outputs",
      code: 400,
    };
  }

  await outputRepository.deleteMany(ids);

  return {
    data: null,
    message: "Successfully deleted outputs",
    code: 204,
  };
};

export const downloadOutputs = async (
  ids: string[] = []
): Promise<Result<any>> => {
  if (ids.length == 0) {
    return {
      data: null,
      message: "Please select outputs",
      code: 400,
    };
  }

  const outputs = await outputRepository.findManyById(ids);

  const transformedOutputs = outputs.map((item) => {
    const { activity, ...restItem } = item;

    return {
      ...restItem,
      activityName: activity.name,
    };
  });

  const file = convertToCsv(transformedOutputs);

  return {
    data: file,
    message: "Successfully downloaded outputs",
    code: 200,
  };
};
