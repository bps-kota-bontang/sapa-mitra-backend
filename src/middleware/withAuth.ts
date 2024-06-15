import { jwt } from "hono/jwt";
import { createMiddleware } from "hono/factory";
import { publicRoute } from "@/config/route";
import { isProduction } from "@/common/utils";
import { JWT } from "@/model/jwt";

const withAuth = createMiddleware(async (c, next) => {
  const isPublicRoute = publicRoute.some(
    (route) => route.path === c.req.path && route.method === c.req.method
  );

  if (isPublicRoute) {
    return next();
  }

  if (!isProduction) {
    const user: JWT = {
      iss: "",
      sub: "",
      aud: "",
      exp: 0,
      nbf: 0,
      iat: 0,
      name: "Dummy",
      nip: "",
      email: "",
      team: "TU",
      position: "ANGGOTA",
    };
    c.set("jwtPayload", user);

    return next();
  }

  const jwtMiddleware = jwt({
    secret: Bun.env.JWT_SECRET || "password",
  });

  return jwtMiddleware(c, next);
});

export default withAuth;
