import { Team } from "@/model/user";

export type SKPosition = "PENDATAAN" | "PEMERIKSAAN" | "PENGOLAHAN";
export type SKStaffSource = "PARTNER" | "MANUAL";

export type SKStaff = {
  source: SKStaffSource;
  partnerNik?: string;
  activityId?: string;
  activityName?: string;
  activityCode?: string;
  name: string;
  position: SKPosition;
  title: string;
  honorRate: number | null;
};

export type SK = {
  number: string;
  date: Date;
  mainActivityId: string;
  mainActivityName: string;
  year: number;
  team: Team[];
  staff: SKStaff[];
  createdBy: string;
};
