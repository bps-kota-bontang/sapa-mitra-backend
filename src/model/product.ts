export type Category = "COFFEE" | "PASTRY" | "ICE_CREAM";

export type Product = {
  id: string;
  name: string;
  nameEnglish: string;
  note: string | null;
  category: Category;
  image: string;
  price: number;
  priceStrikethrough: number;
  additional: string[];
};
