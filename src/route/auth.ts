import { User } from "@/model/user";
import { login, register } from "@/service/auth";

import { Hono } from "hono";

const app = new Hono();

app.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  const result = await login(email, password);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

app.post("/register", async (c) => {
  const data = await c.req.json<User>();

  const result = await register(data);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

export default app;
