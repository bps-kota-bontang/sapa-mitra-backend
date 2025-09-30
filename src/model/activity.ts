import { Team } from "@/model/user";

export type CategoryActivity = "ENUMERATION" | "SUPERVISION" | "PROCESSING";

export type Activity = {
  main: string;
  name: string;
  code: string;
  unit: string;
  category: CategoryActivity;
  team: Team;
  pok: POK;
  isSpecial: boolean;
  year: number;
};

export type POK = {
  program: string;
  activity: string;
  kro: string;
  ro: string;
  component: string;
  subComponent: string;
  account: string;
};
