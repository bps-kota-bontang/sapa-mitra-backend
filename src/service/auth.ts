import { Result } from "@/model/result";
import { User } from "@/model/user";
import UserSchema from "@/schema/user";
import { generateToken } from "@/service/jwt";

export const login = async (
  email: string,
  password: string
): Promise<Result<any>> => {
  const user = await UserSchema.findOne({ email });

  if (!user) {
    return {
      data: null,
      message: "User not found",
      code: 404,
    };
  }
  const { password: hashedPassword, ...restUser } = user.toObject(); // Convert the document to a plain object


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
    ...restUser,
    token: token
  }

  return {
    data: result,
    message: "Successfully logged in",
    code: 200,
  };
};

export const register = async (
  data: User
): Promise<Result<Omit<User, "password">>> => {
  const hashedPassword = await Bun.password.hash(data.password, {
    algorithm: "bcrypt",
  });

  const user = await UserSchema.create({
    ...data,
    password: hashedPassword,
  });

  const { password, ...transformedUser } = user.toObject();

  return {
    data: transformedUser,
    message: "Successfully registered user",
    code: 200,
  };
};
