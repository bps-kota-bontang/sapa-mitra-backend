import { JWT } from "@/model/jwt";
import { MainActivity } from "@/model/mainActivity";
import { Hono } from "hono";
import { deleteMainActivity, getMainActivities, getMainActivity, storeMainActivity, updateMainActivity } from "@/service/mainActivity";

const app = new Hono();

app.get("/", async (c) => {
  const result = await getMainActivities(c.get("jwtPayload") as JWT, c.req.query("year"), c.req.query("active") === "true", c.req.query("team"));
  return c.json({ data: result.data, message: result.message }, result.code);
});

app.get("/:id", async (c) => {
  const result = await getMainActivity(c.req.param("id"), c.get("jwtPayload") as JWT);
  return c.json({ data: result.data, message: result.message }, result.code);
});

app.post("/", async (c) => {
  const result = await storeMainActivity(await c.req.json<MainActivity>(), c.get("jwtPayload") as JWT);
  return c.json({ data: result.data, message: result.message }, result.code);
});

app.put("/:id", async (c) => {
  const result = await updateMainActivity(c.req.param("id"), await c.req.json<Partial<MainActivity>>(), c.get("jwtPayload") as JWT);
  return c.json({ data: result.data, message: result.message }, result.code);
});

app.delete("/:id", async (c) => {
  const result = await deleteMainActivity(c.req.param("id"), c.get("jwtPayload") as JWT);
  return c.json({ data: result.data, message: result.message }, result.code);
});

export default app;