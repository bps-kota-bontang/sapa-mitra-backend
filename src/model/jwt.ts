import { Team, Position } from "@/model/user";

export type JWT = {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  nbf: number;
  iat: number;
  name: string;
  nip: string;
  email: string;
  team: Team | null;
  position: Position;
};
