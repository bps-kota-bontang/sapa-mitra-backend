import { Partner } from "@/model/partner";
import {
  deletePartner,
  getPartners,
  getPartner,
  storePartner,
  updatePartner,
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

app.post("/", async (c) => {
  const payload = await c.req.json<Partner>();

  const result = await storePartner(payload);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

app.put("/:id", async (c) => {
  const payload = await c.req.json<Partner>();
  const id = c.req.param("id");
  const result = await updatePartner(id, payload);

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
  const result = await deletePartner(id);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

export default app;
