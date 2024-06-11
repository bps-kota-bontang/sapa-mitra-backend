import withAuth from "@/middleware/withAuth";
import { Product } from "@/model/product";
import { getProducts, storeProduct } from "@/service/product";
import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
  const result = await getProducts();

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

app.post("/", withAuth, async (c) => {
  const claims = c.get("jwtPayload");
  const payload = await c.req.json<Product>();
  const result = await storeProduct(payload, claims);

  return c.json(
    {
      data: result.data,
      message: result.message,
    },
    result.code
  );
});

export default app;
