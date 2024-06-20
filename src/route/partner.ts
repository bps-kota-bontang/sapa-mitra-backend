import { Partner } from "@/model/partner";
import {
  deletePartner,
  getPartners,
  getPartner,
  storePartner,
  updatePartner,
  uploadPartner,
} from "@/service/partner";
import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
  const result = await getPartners();

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
  const result = await getPartner(id);

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

  const result = await uploadPartner(body['file'] as File, claims);

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
  const payload = await c.req.json<Partner>();

  const result = await storePartner(payload, claims);

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
  const payload = await c.req.json<Partner>();
  const id = c.req.param("id");
  const result = await updatePartner(id, payload, claims);

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
  const result = await deletePartner(id, claims);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

export default app;
