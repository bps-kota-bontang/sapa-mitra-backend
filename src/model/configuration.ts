export type TypeConfiguration = "AUTHORITY" | "REGION";

export type Configuration<T> = {
  name: TypeConfiguration;
  value: T;
};
