import { JWT } from "@/model/jwt";
import { Product } from "@/model/product";
import { Result } from "@/model/result";
import ProductSchema from "@/schema/product";
import UserSchema from "@/schema/user";

export const getProducts = async (): Promise<Result<Product[]>> => {
  const users = await ProductSchema.find();

  return {
    data: users,
    message: "Successfully retrieved product",
    code: 200,
  };
};

export const storeProduct = async (
  payload: Product,
  claims: JWT
): Promise<Result<Product>> => {
  const user = await UserSchema.findById(claims.sub);

  if (!user) {
    return {
      data: null,
      message: "Invalid user",
      code: 404,
    };
  }

  const product = await ProductSchema.create(payload);

  return {
    data: product,
    message: "Successfully created product",
    code: 200,
  };
};
