import { downloadTemplate, toArrayBuffer } from "@/common/utils";
import { Activity } from "@/model/activity";
import {
  deleteActivities,
  deleteActivity,
  downloadActivities,
  getActivities,
  getActivity,
  getMainActivities,
  storeActivity,
  updateActivity,
  uploadActivity,
} from "@/service/activity";
import { Hono } from "hono";

const activity = new Hono();
const publicActivity = new Hono();

activity.get("/", async (c) => {
  const claims = c.get("jwtPayload");
  const year = c.req.query("year");
  const result = await getActivities(year, claims);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code,
  );
});

activity.post("/download", async (c) => {
  const payload = await c.req.json<string[]>();
  const result = await downloadActivities(payload);

  if (result.code != 200) {
    return c.json(
      {
        data: result.data,
        message: result.message,
      },
      result.code,
    );
  }

  c.res.headers.set("Content-Type", "text/csv");
  c.res.headers.set(
    "Content-Disposition",
    `attachment; filename=Master Data Activity.csv`,
  );

  return c.body(toArrayBuffer(result.data));
});

activity.post("/template", async (c) => {
  const result = await downloadTemplate("src/template/activity.csv");

  c.res.headers.set("Content-Type", "text/csv");
  c.res.headers.set(
    "Content-Disposition",
    `attachment; filename=Template Activity.csv`,
  );

  return c.body(toArrayBuffer(result));
});

activity.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await getActivity(id);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code,
  );
});

activity.post("/upload", async (c) => {
  const claims = c.get("jwtPayload");
  const body = await c.req.parseBody();

  const result = await uploadActivity(body["file"] as File, claims);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code,
  );
});

activity.post("/", async (c) => {
  const claims = c.get("jwtPayload");
  const payload = await c.req.json<Activity>();

  const result = await storeActivity(payload, claims);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code,
  );
});

activity.put("/:id", async (c) => {
  const claims = c.get("jwtPayload");
  const payload = await c.req.json<Activity>();
  const id = c.req.param("id");
  const result = await updateActivity(id, payload, claims);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code,
  );
});

activity.delete("/", async (c) => {
  const claims = c.get("jwtPayload");
  const payload = await c.req.json<string[]>();
  const result = await deleteActivities(payload, claims);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code,
  );
});

activity.delete("/:id", async (c) => {
  const claims = c.get("jwtPayload");
  const id = c.req.param("id");
  const result = await deleteActivity(id, claims);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code,
  );
});

publicActivity.get("/main", async (c) => {
  const year = c.req.query("year");
  const result = await getMainActivities(year);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code,
  );
});

export { activity, publicActivity };
