import { JWT } from "@/model/jwt";
import { User } from "@/model/user";
import { sign } from "hono/jwt";

const APP_NAME = Bun.env.APP_NAME || "hono";
const APP_HOST = Bun.env.APP_HOST || "http://localhost:4000";
const JWT_DURATION = parseInt(Bun.env.JWT_DURATION ?? "3600");
const JWT_SECRET = Bun.env.JWT_SECRET || "password";

export const generateToken = async (user: User): Promise<string> => {
  const payload = generatePayload(user);

  const token = await sign(payload, JWT_SECRET);

  return token;
};

export const generatePayload = (user: User | null) => {
  const now = Math.floor(Date.now() / 1000); // Current Unix timestamp

  const payload: JWT = {
    iss: APP_HOST,
    aud: APP_NAME,
    sub: user?.id ?? "1234-5678-9101",
    name: user?.name ?? "Dummy User",
    nip: user?.nip ?? "1111111111111111",
    email: user?.email ?? "user@dummy.com",
    team: user?.team ?? "TU",
    position: user?.position ?? "KETUA",
    exp: now + JWT_DURATION, // Token expires in 5 minutes
    nbf: now, // Token is not valid before the current time
    iat: now, // Token was issued at the current time
  };

  return payload;
};
