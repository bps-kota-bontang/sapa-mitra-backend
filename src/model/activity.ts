import { Team } from "@/model/user";

export type TypeActivity = "ENUMERATION" | "SUPERVISION" | "PROCESSING";

export type Activity = {
  name: string;
  code: string;
  unit: string;
  type: TypeActivity;
  team: Team;
};
