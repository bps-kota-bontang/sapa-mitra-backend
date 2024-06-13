import { jwt } from "hono/jwt";
import { createMiddleware } from "hono/factory";
import { publicRoute } from "@/config/route";

const withAuth = createMiddleware(async (c, next) => {
  const isPublicRoute = publicRoute.some(
    (route) => route.path === c.req.path && route.method === c.req.method
  );

  if (isPublicRoute) {
    return next();
  }

  const jwtMiddleware = jwt({
    secret: Bun.env.JWT_SECRET || "password",
  });

  return jwtMiddleware(c, next);
});

export default withAuth;
