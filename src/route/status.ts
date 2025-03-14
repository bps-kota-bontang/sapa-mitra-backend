import {
  getStatuses,
  getStatus,
  updateStatusContract,
  updateStatusOutput,
} from "@/service/status";
import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
  const claims = c.get("jwtPayload");
  const result = await getStatuses(claims);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

app.get("/:period", async (c) => {
  const claims = c.get("jwtPayload");
  const period = c.req.param("period");
  const result = await getStatus(period);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

app.put("/:period/contract", async (c) => {
  const claims = c.get("jwtPayload");
  const period = c.req.param("period");
  const payload = await c.req.json<{
    is_locked: boolean;
  }>();

  const result = await updateStatusContract(period, payload.is_locked, claims);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

app.put("/:period/output", async (c) => {
  const claims = c.get("jwtPayload");
  const period = c.req.param("period");
  const payload = await c.req.json<{
    is_locked: boolean;
  }>();

  const result = await updateStatusOutput(period, payload.is_locked, claims);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

export default app;
