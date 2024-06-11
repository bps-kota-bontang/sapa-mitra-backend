import { Activity } from "@/model/activity";
import {
  deleteActivity,
  getActivities,
  getActivity,
  storeActivity,
  updateActivity,
} from "@/service/activity";
import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
  const result = await getActivities();

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
  const result = await getActivity(id);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

app.post("/", async (c) => {
  const payload = await c.req.json<Activity>();

  const result = await storeActivity(payload);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

app.put("/:id", async (c) => {
  const payload = await c.req.json<Activity>();
  const id = c.req.param("id");
  const result = await updateActivity(id, payload);

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
  const result = await deleteActivity(id);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

export default app;
