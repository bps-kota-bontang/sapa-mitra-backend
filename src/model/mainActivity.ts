import { Team } from "@/model/user";

export type MainActivity = {
  name: string;
  normalizedName: string;
  year: number;
  isActive: boolean;
  team?: Team[];
};