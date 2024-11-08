import { Team } from "@/model/user";

export type CategoryActivity = "ENUMERATION" | "SUPERVISION" | "PROCESSING";

export type Activity = {
  name: string;
  code: string;
  unit: string;
  category: CategoryActivity;
  team: Team;
  isSpecial: boolean;
  year: number;
};
