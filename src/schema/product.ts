import { Product } from "@/model/product";
import { Schema, model } from "mongoose";

export const productSchema = new Schema<Product>(
  {
    name: { type: String, required: true },
    name_english: { type: String, required: true },
    note: { type: String, required: false },
    category: {
      type: String,
      required: true,
      enum: ["COFFEE", "PASTRY", "ICE_CREAM"],
    },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    price_strikethrough: { type: Number, required: true },
    additional: { type: [String], required: false },
  },
  {
    timestamps: true,
  }
);

const ProductSchema = model("products", productSchema);

export default ProductSchema;
