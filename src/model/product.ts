export type Category = "COFFEE" | "PASTRY" | "ICE_CREAM";

export type Product = {
  id: string;
  name: string;
  name_english: string;
  note: string | null;
  category: Category;
  image: string;
  price: number;
  price_strikethrough: number;
  additional: string[];
};
