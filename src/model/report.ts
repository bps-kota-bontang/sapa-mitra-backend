import { Authority } from "@/model/authority";
import { Partner } from "@/model/partner";
import { Document } from "mongoose";
import { Contract, YearMonth } from "@/model/contract";
import { Output } from "@/model/output";

export type Report = {
  number: string;
  authority: Authority;
  partner: Pick<Partner, "name" | "nik" | "address"> & Document;
  contract: Pick<Contract, "number" | "period" | "handOverDate">;
  outputs: (Pick<Output, "name" | "unit"> & {
    total: number;
  } & Document)[];
};

export type ReportPayload = {
  contract: Pick<Contract, "period">;
  outputs: [
    {
      outputId: string;
    } & Pick<Report["outputs"][number], "total">
  ];
  partner: {
    partnerId: string;
  };
};

export type ReportByOutputPayload = {
  contract: Pick<Contract, "period">;
  output: {
    outputId: string;
  };
  partners: [
    {
      partnerId: string;
    } & Pick<Report["outputs"][number], "total">
  ];
};

const reportPayload: ReportPayload = {
  contract: {
    period: "2020-01",
  },
  outputs: [
    {
      outputId: "456",
      total: 121,
    },
  ],
  partner: {
    partnerId: "123",
  },
};

const reportByOutputPayload: ReportByOutputPayload = {
  contract: {
    period: "2024-04",
  },
  output: {
    outputId: "666c5ac7bbf959e48194a7dd",
  },
  partners: [
    {
      partnerId: "666c5ad1bbf959e48194a7e0",
      total: 2,
    },
  ],
};

export type ReportPdf = {
  number: string;
  contract: {
    number: string;
  };
  period: {
    month: string;
    year: string;
  };
  authority: Authority;
  partner: Partner;
  handOver: {
    dayText: string;
    dateText: string;
    monthText: string;
    yearText: string;
  };
  outputs: {
    name: string;
    unit: string;
    total: number;
  }[];
  region: string;
};
