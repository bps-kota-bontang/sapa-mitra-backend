import { Team } from "@/model/user";

export type CategoryActivity = "ENUMERATION" | "SUPERVISION" | "PROCESSING";

export type Activity = {
  _id: string;
  name: string;
  code: string;
  unit: string;
  category: CategoryActivity;
  team: Team;
  isSpecial: boolean;
  createdAt: Date;
  updatedAt: Date;
};
