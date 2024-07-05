export type TypeConfiguration = "AUTHORITY" | "REGION" | "RATE";

export interface Limits {
  enumeration: string;
  supervision: string;
  processing: string;
}

export type Configuration<T> = {
  name: TypeConfiguration;
  value: T;
};
