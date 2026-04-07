import { createMiddleware } from "hono/factory";

const withApiKey = createMiddleware(async (c, next) => {
  const apiKey = c.req.header("X-API-Key") || c.req.query("api_key");
  const validApiKey = Bun.env.PUBLIC_API_KEY;

  if (!validApiKey) {
    return c.json(
      {
        message: "API key validation not configured",
        data: null,
      },
      500,
    );
  }

  if (!apiKey) {
    return c.json(
      {
        message: "API key is required",
        data: null,
      },
      401,
    );
  }

  if (apiKey !== validApiKey) {
    return c.json(
      {
        message: "Invalid API key",
        data: null,
      },
      401,
    );
  }

  return next();
});

export default withApiKey;
