import { storeContract, storeContractByActivity } from "@/service/contract";
import { Hono } from "hono";

const app = new Hono();

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
