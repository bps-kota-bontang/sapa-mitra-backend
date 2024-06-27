import { Output } from "@/model/output";
import {
  deleteOutput,
  getOutputs,
  getOutput,
  storeOutput,
  updateOutput,
  uploadOutput,
  deleteOutputs,
} from "@/service/output";
import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
  const result = await getOutputs();

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
  const result = await getOutput(id);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

app.post("/upload", async (c) => {
  const claims = c.get("jwtPayload");
  const body = await c.req.parseBody();

  const result = await uploadOutput(body["file"] as File, claims);

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
  const payload = await c.req.json<Output>();

  const result = await storeOutput(payload, claims);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

app.put("/:id", async (c) => {
  const claims = c.get("jwtPayload");
  const payload = await c.req.json<Output>();
  const id = c.req.param("id");
  const result = await updateOutput(id, payload, claims);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

app.delete("/", async (c) => {
  const claims = c.get("jwtPayload");
  const payload = await c.req.json<string[]>();
  const result = await deleteOutputs(payload, claims);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

app.delete("/:id", async (c) => {
  const claims = c.get("jwtPayload");
  const id = c.req.param("id");
  const result = await deleteOutput(id, claims);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

export default app;
