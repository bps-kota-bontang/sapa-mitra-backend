import {
  calculateHandOverDate,
  calculateSignDate,
  generateContractNumber,
  isProduction,
  notEmpty,
} from "@/common/utils";
import {
  Contract,
  ContractByActivityPayload,
  ContractPayload,
} from "@/model/contract";
import { JWT } from "@/model/jwt";
import { Result } from "@/model/result";
import ActivitySchema from "@/schema/activity";
import ConfigurationSchema from "@/schema/configuration";
import ContractSchema from "@/schema/contract";
import PartnerSchema from "@/schema/partner";

export const getContracts = async (
  period: string = "",
  status: string = "",
  claims: JWT
): Promise<Result<Contract[]>> => {
  let queries: any = {};

  if (period) queries.period = period;
  if (status) queries["activities.status"] = status;

  if (status == "VERIFIED" || status == "UNVERIFIED") {
    queries["activities.createdBy"] = claims.team;
  }

  const contracts = await ContractSchema.find(queries);

  return {
    data: contracts,
    message: "Successfully retrieved contracts",
    code: 200,
  };
};

export const getContract = async (id: string): Promise<Result<Contract>> => {
  const contract = await ContractSchema.findById(id);

  return {
    data: contract,
    message: "Successfully retrieved contract",
    code: 200,
  };
};

export const storeContractByActivity = async (
  payload: ContractByActivityPayload,
  claims: JWT
): Promise<Result<Contract[]>> => {
  if (claims.position == "KEPALA") {
    return {
      data: null,
      message: "Head office can't create contracts",
      code: 401,
    };
  }

  const { activityId, ...restActivityPayload } = payload.activity;

  const partnerIds = payload.partners.map((item) => item.partnerId);
  const partners = await PartnerSchema.find({
    _id: { $in: partnerIds },
  }).select(["name", "nik", "address"]);

  const existingContracts = await ContractSchema.find({
    "partner._id": { $in: partnerIds },
    period: payload.contract.period,
  }).select(["partner._id", "period", "grandTotal", "activities"]);

  const signDate = calculateSignDate(payload.contract.period);
  const handOverDate = calculateHandOverDate(payload.contract.period);

  const authority = await ConfigurationSchema.findOne({
    name: "AUTHORITY",
  });

  const activityDb = await ActivitySchema.findById(activityId).select([
    "code",
    "name",
  ]);

  if (!activityDb) {
    return {
      data: null,
      message: "Activity not found",
      code: 404,
    };
  }

  const bulkOps = payload.partners
    .map((item) => {
      const number = generateContractNumber();

      const partner = partners.find(
        (partner) => partner._id.toString() == item.partnerId
      );

      if (!partner) return null;

      const existingContract = existingContracts.find(
        (contract) =>
          contract.partner._id == item.partnerId &&
          contract.period == payload.contract.period
      );

      const activity = {
        ...activityDb.toObject(),
        ...restActivityPayload,
        volume: item.volume,
        total: item.volume * payload.activity.rate,
        createdBy: claims.team,
      };

      let update;

      if (existingContract) {
        const existingActivity = existingContract.activities.find(
          (item) => item.id == activity._id
        );

        if (existingActivity) {
          update = {
            $set: {
              grandTotal:
                existingContract.grandTotal +
                activity.total -
                existingActivity.total,
              "activities.$": activity,
            },
          };

          return {
            updateMany: {
              filter: {
                "partner._id": item.partnerId,
                period: payload.contract.period,
                "activities._id": existingActivity.id,
              },
              update,
            },
          };
        } else {
          update = {
            $push: { activities: activity },
            $set: {
              grandTotal: existingContract.grandTotal + activity.total,
            },
          };

          return {
            updateOne: {
              filter: {
                "partner._id": item.partnerId,
                period: payload.contract.period,
              },
              update,
            },
          };
        }
      } else {
        update = {
          number,
          period: payload.contract.period,
          authority : authority?.value,
          partner,
          activities: [activity],
          signDate,
          handOverDate,
          penalty: 0,
          grandTotal: activity.total,
        };

        return {
          updateOne: {
            filter: {
              "partner._id": item.partnerId,
              period: payload.contract.period,
            },
            update,
            upsert: true,
          },
        };
      }
    })
    .filter(notEmpty);

  if (bulkOps.length == 0) {
    return {
      data: null,
      message: "Partners not found",
      code: 404,
    };
  }

  await ContractSchema.bulkWrite(bulkOps);

  const contracts = await ContractSchema.find({
    "partner._id": { $in: partnerIds },
    period: payload.contract.period,
  });

  return {
    data: contracts,
    message: "Successfully created contracts",
    code: 201,
  };
};

export const storeContract = async (
  payload: ContractPayload,
  claims: JWT
): Promise<Result<Contract>> => {
  if (claims.position == "KEPALA") {
    return {
      data: null,
      message: "Head office can't create a contract",
      code: 401,
    };
  }

  const existingContract = await ContractSchema.findOne({
    "partner._id": payload.partner.partnerId,
    period: payload.contract.period,
  }).select(["_id", "grandTotal"]);

  const number = generateContractNumber();

  const authority = await ConfigurationSchema.findOne({
    name: "AUTHORITY",
  });

  const partner = await PartnerSchema.findById(
    payload.partner.partnerId
  ).select(["name","nik", "address"]);

  if (!partner) {
    return {
      data: null,
      message: "Partner not found",
      code: 404,
    };
  }

  const activityIds = payload.activities.map((item) => item.activityId);

  const activitiesDb = await ActivitySchema.find({
    _id: { $in: activityIds },
  }).select(["code", "name"]);

  if (activitiesDb.length == 0) {
    return {
      data: null,
      message: "Activity not found",
      code: 404,
    };
  }

  const activities = payload.activities
    .map((itemPayload) => {
      const { activityId, ...restPayload } = itemPayload;
      const itemDb = activitiesDb.find(
        (found) => found._id.toString() === activityId
      );
      return itemDb
        ? {
            ...restPayload,
            ...itemDb.toObject(),
            total: restPayload.volume * restPayload.rate,
            createdBy: claims.team,
          }
        : null;
    })
    .filter(notEmpty);

  const grandTotal = activities.reduce(
    (total, activity) => total + activity.total,
    0
  );

  const signDate = calculateSignDate(payload.contract.period);
  const handOverDate = calculateHandOverDate(payload.contract.period);

  const data = {
    number: number,
    period: payload.contract.period,
    authority : authority?.value,
    partner: partner,
    activities: activities,
    signDate: signDate,
    handoverDate: handOverDate,
    penalty: 0,
    grandTotal: grandTotal,
  };

  let contract;
  if (existingContract) {
    const activityIdsMatched = activities.map((item) => item._id);

    const activityContract = await ContractSchema.findOne({
      _id: existingContract.id,
      "activities._id": { $in: activityIdsMatched },
    });

    if (activityContract) {
      const newActivities = activities.filter(
        (item) =>
          !activityContract.activities.some((itemDb) => itemDb.id == item._id)
      );

      const existActivities = activities.filter((item) =>
        activityContract.activities.some((itemDb) => itemDb.id == item._id)
      );

      if (newActivities.length > 0) {
        const newGrandTotal = newActivities.reduce(
          (total, activity) => total + activity.total,
          0
        );
        await ContractSchema.findOneAndUpdate(
          {
            _id: existingContract.id,
          },
          {
            $set: {
              grandTotal: existingContract.grandTotal + newGrandTotal,
            },
            $push: { activities: newActivities },
          },
          {
            new: true,
          }
        );
      }

      if (existActivities.length > 0) {
        const existingContractUpdated = await ContractSchema.findById(
          existingContract.id
        );

        if (!existingContractUpdated) {
          return {
            data: null,
            message: "Something wrong",
            code: 400,
          };
        }

        const bulkOps = existActivities.map((activity) => {
          const activityDb = existingContractUpdated.activities.find((item) => {
            return item.id == activity._id.toString();
          });
          const grandTotal =
            activity.total - (activityDb ? activityDb.total : 0);

          const update = {
            $inc: {
              grandTotal: grandTotal,
            },
            $set: {
              "activities.$": activity,
            },
          };

          return {
            updateMany: {
              filter: {
                _id: existingContract.id,
                "activities._id": activity._id,
              },
              update,
            },
          };
        });

        if (bulkOps.length > 0) {
          await ContractSchema.bulkWrite(bulkOps);
        }
      }

      contract = await ContractSchema.findOne({
        "partner._id": payload.partner.partnerId,
        period: payload.contract.period,
      });
    } else {
      contract = await ContractSchema.findOneAndUpdate(
        {
          _id: existingContract.id,
        },
        {
          $set: {
            grandTotal: existingContract.grandTotal + grandTotal,
          },
          $push: { activities: activities },
        },
        {
          new: true,
        }
      );
    }
  } else {
    contract = await ContractSchema.create(data);
  }

  return {
    data: contract,
    message: "Successfully created contract",
    code: 201,
  };
};

export const deletContract = async (id: string): Promise<Result<any>> => {
  await ContractSchema.findByIdAndDelete(id);

  return {
    data: null,
    message: "Successfully deleted contract",
    code: 204,
  };
};

export const deleteContractActivity = async (
  id: string,
  activityId: string
): Promise<Result<Contract>> => {
  const existingContract = await ContractSchema.findById(id);

  if (!existingContract) {
    return {
      data: null,
      message: "Contract not found",
      code: 404,
    };
  }

  const activity = existingContract.activities.find(
    (item) => item.id == activityId
  );

  if (!activity) {
    return {
      data: null,
      message: "Activity not found",
      code: 404,
    };
  }

  const grandTotal = existingContract.grandTotal - activity.total;

  const contract = await ContractSchema.findOneAndUpdate(
    {
      _id: id,
    },
    {
      $pull: {
        activities: { _id: activityId },
      },
      $set: {
        grandTotal: grandTotal,
      },
    },
    {
      new: true,
    }
  );

  return {
    data: contract,
    message: "Successfully deleted contract",
    code: 204,
  };
};

export const printContract = async (
  id: string,
  claims: JWT
): Promise<Result<Contract>> => {
  if (claims.team != "TU" && isProduction) {
    return {
      data: null,
      message: "Only TU can print a contract",
      code: 401,
    };
  }

  const contract = await ContractSchema.findById(id);

  if (!contract) {
    return {
      data: null,
      message: "Contract not found",
      code: 404,
    };
  }

  const isCompleted = contract.activities.every(
    (item) => item.status === "VERIFIED"
  );

  if (!isCompleted) {
    return {
      data: null,
      message: "Activity contract has not been fully verified",
      code: 400,
    };
  }

  return {
    data: contract,
    message: "Successfully print contract",
    code: 200,
  };
};

export const printContracts = async (
  period: string = "",
  claims: JWT
): Promise<Result<Contract[]>> => {
  let queries: any = {};

  if (period) queries.period = period;

  queries.activities = {
    $all: [{ $elemMatch: { status: "VERIFIED" } }],
  };

  if (claims.team != "TU" && isProduction) {
    return {
      data: null,
      message: "Only TU can print a contract",
      code: 401,
    };
  }

  const contracts = await ContractSchema.find(queries);

  if (contracts.length == 0) {
    return {
      data: null,
      message: "All contracts have not been verified by activities",
      code: 404,
    };
  }

  return {
    data: contracts,
    message: "Successfully print contract",
    code: 200,
  };
};
