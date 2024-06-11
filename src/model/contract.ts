import { Partner } from "@/model/partner";
import { Activity } from "@/model//activity";

export type MonthYear = `${number}-${number}`;

export type Contract = {
  number: string;
  date: MonthYear;
  partner: Pick<Partner, "name" | "address">;
  activities: (Pick<Activity, "code" | "name"> & {
    start_date: Date;
    end_date: Date;
    volume: number;
    unit: string;
    rate: number;
    total: number;
  })[];
  sign_date: Date;
  handover_date: Date;
  penalty: number;
  grand_total: number;
};
