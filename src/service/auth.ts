import { Result } from "@/model/result";
import { factoryRepository } from "@/repository/factory";
import { mongoUserRepository } from "@/repository/impl/mongo/user";
import { postgresUserRepository } from "@/repository/impl/postgres/user";
import { UserRepository } from "@/repository/user";
import { generateToken } from "@/service/jwt";
import { getUserInfo } from "@/service/sso";

const userRepository: UserRepository = factoryRepository(
  mongoUserRepository,
  postgresUserRepository
);

export const login = async (
  email: string,
  password: string
): Promise<Result<any>> => {
  const user = await userRepository.findOne({ email });

  if (!user) {
    return {
      data: null,
      message: "User not found",
      code: 404,
    };
  }
  const { password: hashedPassword, ...restUser } = user;

  const isMatch = await Bun.password.verify(password, hashedPassword);

  if (!isMatch) {
    return {
      data: null,
      message: "Invalid credential",
      code: 400,
    };
  }

  const token = await generateToken(user);

  const result = {
    token: token,
  };

  return {
    data: result,
    message: "Successfully logged in",
    code: 200,
  };
};

export const loginSso = async (tokenSso: string): Promise<Result<any>> => {
  const userSso = await getUserInfo(tokenSso);

  const user = await userRepository.findOne({ email: userSso.email });

  if (!user) {
    return {
      data: null,
      message: "User not found",
      code: 404,
    };
  }

  const token = await generateToken(user);

  const result = {
    token: token,
  };

  return {
    data: result,
    message: "Successfully logged in",
    code: 200,
  };
};
