export type TypeConfiguration = "AUTHORITY" | "REGION" | "RATE";

export type Configuration<T> = {
  name: TypeConfiguration;
  value: T;
};
