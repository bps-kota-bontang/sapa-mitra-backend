import { Hono } from "hono";
import { JWT } from "@/model/jwt";
import { SK } from "@/model/sk";
import { createSK, deleteSK, getSK, getSKs, syncSKStaff, updateSK } from "@/service/sk";

const app = new Hono();

app.get("/", async (c) => {
  const result = await getSKs(c.get("jwtPayload") as JWT);
  return c.json({ data: result.data, message: result.message }, result.code);
});

app.get("/sync", async (c) => {
  const result = await syncSKStaff(c.req.query("mainActivityId") ?? "", c.get("jwtPayload") as JWT);
  return c.json({ data: result.data, message: result.message }, result.code);
});

app.get("/:id", async (c) => {
  const result = await getSK(c.req.param("id"), c.get("jwtPayload") as JWT);
  return c.json({ data: result.data, message: result.message }, result.code);
});

app.post("/", async (c) => {
  const result = await createSK(await c.req.json<Partial<SK>>(), c.get("jwtPayload") as JWT);
  return c.json({ data: result.data, message: result.message }, result.code);
});

app.put("/:id", async (c) => {
  const result = await updateSK(c.req.param("id"), await c.req.json<Partial<SK>>(), c.get("jwtPayload") as JWT);
  return c.json({ data: result.data, message: result.message }, result.code);
});

app.delete("/:id", async (c) => {
  const result = await deleteSK(c.req.param("id"), c.get("jwtPayload") as JWT);
  return c.json({ data: result.data, message: result.message }, result.code);
});

export default app;
