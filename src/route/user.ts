import { getUsers, getUser } from "@/service/user";
import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
  const claims = c.get("jwtPayload");
  const result = await getUsers(claims);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});


app.get("/me", async (c) => {
  const claims = c.get("jwtPayload");
  const result = await getUser(claims.sub);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

export default app;
