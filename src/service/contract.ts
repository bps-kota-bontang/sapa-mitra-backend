import {
  calculateHandOverDate,
  calculateSignDate,
  generateContractNumber,
  notEmpty,
} from "@/common/utils";
import { ContractByActivityPayload, ContractPayload } from "@/model/contract";
import { JWT } from "@/model/jwt";
import { Result } from "@/model/result";
import ActivitySchema from "@/schema/activity";
import ContractSchema from "@/schema/contract";
import PartnerSchema from "@/schema/partner";

export const storeContractByActivity = async (
  payload: ContractByActivityPayload,
  claims: JWT
): Promise<Result<any>> => {
  if (claims.position != "ANGGOTA") {
    return {
      data: null,
      message: "Only members can create contracts",
      code: 401,
    };
  }

  const { activityId, ...restActivityPayload } = payload.activity;

  const partnerIds = payload.partners.map((item) => item.partnerId);
  const partners = await PartnerSchema.find({
    _id: { $in: partnerIds },
  }).select(["name", "address"]);

  const existingContracts = await ContractSchema.find({
    "partner._id": { $in: partnerIds },
    date: payload.contract.date,
  }).select(["partner._id", "date"]);

  const signDate = calculateSignDate(payload.contract.date);
  const handOverDate = calculateHandOverDate(payload.contract.date);

  const activity = await ActivitySchema.findById(activityId).select([
    "code",
    "name",
  ]);

  if (!activity) {
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
          contract.date == payload.contract.date
      );

      const activities = {
        ...activity.toObject(),
        ...restActivityPayload,
        volume: item.volume,
        total: item.volume * payload.activity.rate,
        createdBy: claims.team,
      };

      const update = existingContract
        ? { $push: { activities: activities } }
        : {
            number,
            date: payload.contract.date,
            partner,
            activities: [activities],
            signDate,
            handOverDate,
            penalty: 0,
            grandTotal: item.volume * payload.activity.rate,
          };

      return {
        updateOne: {
          filter: {
            "partner._id": item.partnerId,
            date: payload.contract.date,
          },
          update,
          upsert: !existingContract,
        },
      };
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
    date: payload.contract.date,
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
): Promise<Result<any>> => {
  if (claims.position != "ANGGOTA") {
    return {
      data: null,
      message: "Only members can create a contract",
      code: 401,
    };
  }

  const number = generateContractNumber();
  const partner = await PartnerSchema.findById(
    payload.partner.partnerId
  ).select(["name", "address"]);

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

  const signDate = calculateSignDate(payload.contract.date);
  const handOverDate = calculateHandOverDate(payload.contract.date);

  const data = {
    number: number,
    date: payload.contract.date,
    partner: partner,
    activities: activities,
    signDate: signDate,
    handoverDate: handOverDate,
    penalty: 0,
    grandTotal: grandTotal,
  };

  const contract = await ContractSchema.create(data);

  return {
    data: contract,
    message: "Successfully created contract",
    code: 201,
  };
};
