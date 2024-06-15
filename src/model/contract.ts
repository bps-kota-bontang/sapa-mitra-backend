import { Partner } from "@/model/partner";
import { Activity } from "@/model//activity";
import { Document } from "mongoose";
import { Team } from "@/model/user";
import { Authority } from "@/model/authority";

export type YearMonth = `${number}-${number}`;

export type StatusContract = "UNVERIFIED" | "VERIFIED";

export type Contract = {
  number: string;
  period: YearMonth;
  authority: Authority;
  partner: Pick<Partner, "name" | "nik" | "address"> & Document;
  activities: (Pick<Activity, "code" | "name"> & {
    startDate: Date;
    endDate: Date;
    volume: number;
    unit: string;
    rate: number;
    total: number;
    createdBy: Team;
    status: StatusContract;
  } & Document)[];
  signDate: Date;
  handoverDate: Date;
  penalty: number;
  grandTotal: number;
};

export type ContractByActivityPayload = {
  activity: {
    activityId: string;
  } & Pick<
    Contract["activities"][number],
    "startDate" | "endDate" | "unit" | "rate"
  >;
  contract: Pick<Contract, "period">;
  partners: [
    {
      partnerId: string;
    } & Pick<Contract["activities"][number], "volume">
  ];
};

export type ContractPayload = {
  partner: {
    partnerId: string;
  };
  contract: Pick<Contract, "period">;
  activities: [
    {
      activityId: string;
    } & Pick<
      Contract["activities"][number],
      "startDate" | "endDate" | "volume" | "unit" | "rate"
    >
  ];
};

const byActivity: ContractByActivityPayload = {
  partners: [
    {
      partnerId: "1",
      volume: 1,
    },
  ],
  contract: {
    period: "2020-02",
  },
  activity: {
    activityId: "xxxxx-xxxxx-xxx",
    startDate: new Date(),
    endDate: new Date(),
    unit: "Bundle",
    rate: 1000,
  },
};

const byPartner: ContractPayload = {
  partner: {
    partnerId: "zzzzzz-zzzzz-zzzzzzz",
  },
  contract: {
    period: "2020-02",
  },
  activities: [
    {
      activityId: "xxxxx-xxxxx-xxx",
      startDate: new Date(),
      endDate: new Date(),
      volume: 1,
      unit: "Bundle",
      rate: 1000,
    },
  ],
};
