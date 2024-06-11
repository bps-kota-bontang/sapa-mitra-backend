export type TypeConfiguration = "AUTHORITIES" | "REGION";

export type Configuration<T> = {
  name: TypeConfiguration;
  value: T;
};
