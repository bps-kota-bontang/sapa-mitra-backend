import { toArrayBuffer } from "@/common/utils";
import {
  deleteReport,
  deleteReportOutput,
  getReport,
  getReports,
  printReport,
  printReports,
  storeReport,
  storeReportByOutput,
} from "@/service/report";
import { Hono } from "hono";

const app = new Hono();

app.post("/:id/print", async (c) => {
  const claims = c.get("jwtPayload");
  const id = c.req.param("id");

  const result = await printReport(id, claims);

  if (result.code != 200) {
    return c.json(
      {
        data: result.data,
        message: result.message,
      },
      result.code
    );
  }

  c.res.headers.set("Content-Type", "application/pdf");
  c.res.headers.set(
    "Content-Disposition",
    `attachment; filename=BAST ${result.data.period} - ${result.data.name}.pdf`
  );

  return c.body(toArrayBuffer(result.data.file));
});

app.post("/print", async (c) => {
  const claims = c.get("jwtPayload");
  const payload = await c.req.json<string[]>();

  const result = await printReports(payload, claims);

  if (result.code != 200) {
    return c.json(
      {
        data: result.data,
        message: result.message,
      },
      result.code
    );
  }

  c.res.headers.set("Content-Type", "application/pdf");
  c.res.headers.set(
    "Content-Disposition",
    `attachment; filename=SPK ${new Date().valueOf()}.pdf`
  );

  return c.body(toArrayBuffer(result.data));
});

app.get("/", async (c) => {
  const period = c.req.query("period");

  const result = await getReports(period);

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

  const result = await getReport(id);

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

  const result = await deleteReport(id);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

app.delete("/:id/output/:outputId", async (c) => {
  const id = c.req.param("id");
  const outputId = c.req.param("outputId");

  const result = await deleteReportOutput(id, outputId);

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
  if (by == "output") {
    result = await storeReportByOutput(payload, claims);
  } else {
    result = await storeReport(payload, claims);
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
