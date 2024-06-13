import { storeContract, storeContractByActivity } from "@/service/contract";
import { Hono } from "hono";

const app = new Hono();

app.post("/", async (c) => {
  const by = c.req.query("by");
  const payload = await c.req.json();

  let result;
  if (by == "activity") {
    result = await storeContractByActivity(payload);
  } else {
    result = await storeContract(payload);
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
