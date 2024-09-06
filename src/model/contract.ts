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
  activities: (Pick<Activity, "code" | "name" | "unit" | "category" | "isSpecial"> & {
    startDate: Date;
    endDate: Date;
    volume: number;
    rate: number;
    total: number;
    createdBy: Team;
    status: StatusContract;
  } & Document)[];
  signDate: Date;
  handOverDate: Date;
  penalty: number;
  grandTotal: number;
};

export type ContractByActivityPayload = {
  activity: {
    activityId: string;
  } & Pick<Contract["activities"][number], "startDate" | "endDate" | "rate">;
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
      "startDate" | "endDate" | "volume" | "rate"
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
      rate: 1000,
    },
  ],
};

export type ContractActivityPayload = {
  volume: number;
} & Pick<Contract["activities"][number], "startDate" | "endDate" | "rate">;

export type UpdateContractPayload = {
  number: string;
  grandTotal: number;
};

export type DownloadContractsPayload = {
  contracts: [
    {
      contractId: string;
    }
  ];
};

export type ContractPdf = {
  number: string;
  period: {
    month: string;
    year: string;
  };
  authority: Pick<Authority, "name" | "address">;
  partner: Pick<Partner, "name" | "address">;
  sign: {
    dayText: string;
    dateText: string;
    monthText: string;
    yearText: string;
    dateFull: string;
  };
  final: {
    dateFull: string;
  };
  activities: {
    name: string;
    volume: number;
    unit: string;
    date: string;
    total: string;
    budget: number;
  }[];
  handOver: {
    dateFull: string;
  };
  grandTotal: {
    nominal: string;
    spell: string;
  };
  region: string;
};

export const contractActivityPayload: ContractActivityPayload = {
  startDate: new Date(),
  endDate: new Date(),
  volume: 1,
  rate: 200,
};
