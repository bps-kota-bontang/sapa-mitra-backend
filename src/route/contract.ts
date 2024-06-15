import {
  deletContract,
  deleteContractActivity,
  getContract,
  getContracts,
  printContract,
  printContracts,
  storeContract,
  storeContractByActivity,
} from "@/service/contract";
import { Hono } from "hono";

const app = new Hono();

app.get("/:id/print", async (c) => {
  const claims = c.get("jwtPayload");
  const id = c.req.param("id");

  const result = await printContract(id, claims);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

app.get("/print", async (c) => {
  const claims = c.get("jwtPayload");
  const period = c.req.query("period");

  const result = await printContracts(period, claims);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

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

app.get("/:id", async (c) => {
  const id = c.req.param("id");

  const result = await getContract(id);

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

app.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const result = await deletContract(id);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

app.delete("/:id/activity/:activityId", async (c) => {
  const id = c.req.param("id");
  const activityId = c.req.param("activityId");

  const result = await deleteContractActivity(id, activityId);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

export default app;
