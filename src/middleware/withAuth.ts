import { jwt } from "hono/jwt";
import { createMiddleware } from "hono/factory";

const withAuth = createMiddleware(async (c, next) => {
  const jwtMiddleware = jwt({
    secret: Bun.env.JWT_SECRET || "password",
  });

  return jwtMiddleware(c, next);
});

export default withAuth;
