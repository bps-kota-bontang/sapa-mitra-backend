import {
  getContracts,
  storeContract,
  storeContractByActivity,
} from "@/service/contract";
import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
  const claims = c.get("jwtPayload");
  const period = c.req.query("period");
  const status = c.req.query("status");

  const result = await getContracts(period, status, claims);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

app.post("/", async (c) => {
  const claims = c.get("jwtPayload");
  const by = c.req.query("by");
  const payload = await c.req.json();

  let result;
  if (by == "activity") {
    result = await storeContractByActivity(payload, claims);
  } else {
    result = await storeContract(payload, claims);
  }

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

export default app;
