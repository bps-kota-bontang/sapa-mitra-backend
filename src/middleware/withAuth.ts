import { jwt } from "hono/jwt";
import { createMiddleware } from "hono/factory";
import { publicRoute } from "@/config/route";
import { isProduction } from "@/common/utils";
import { generatePayload } from "@/service/jwt";
import { UserRepository } from "@/repository/user";
import { factoryRepository } from "@/repository/factory";
import { mongoUserRepository } from "@/repository/impl/mongo/user";
import { postgresUserRepository } from "@/repository/impl/postgres/user";

const userRepository: UserRepository = factoryRepository(
  mongoUserRepository,
  postgresUserRepository
);

const withAuth = createMiddleware(async (c, next) => {
  const isPublicRoute = publicRoute.some(
    (route) => route.path === c.req.path && route.method === c.req.method
  );

  if (isPublicRoute) {
    return next();
  }

  if (!isProduction && !c.req.header("Authorization")) {
    const user = await userRepository.findOne();

    const payload = generatePayload(user);

    c.set("jwtPayload", payload);

    return next();
  }

  const jwtMiddleware = jwt({
    secret: Bun.env.JWT_SECRET || "password",
  });

  return jwtMiddleware(c, next);
});

export default withAuth;
