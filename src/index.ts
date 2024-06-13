import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { etag } from "hono/etag";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import apiV1 from "@/api/v1";
import connectDB from "@/config/db";
import withAuth from "@/middleware/withAuth";

const app = new Hono();

connectDB();

app.use(prettyJSON());
app.use(etag(), logger());
app.use(withAuth);
app.use("/static/*", serveStatic({ root: "./" }));
app.get("/", (c) => c.text("Sapa Mitra API"));

app.notFound((c) => {
  return c.json(
    {
      message: "invalid endpoint",
      data: null,
    },
    404
  );
});

app.onError((err, c) => {
  return c.json(
    {
      message: err.message,
      data: null,
    },
    500
  );
});

app.route("/v1", apiV1);

export default {
  port: 4000,
  fetch: app.fetch,
};
