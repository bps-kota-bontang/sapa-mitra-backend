import { Configuration } from "@/model/configuration";

export interface ConfigurationRepository {
  create(data: any): Promise<Configuration<any>>;
  createMany(data: any[]): Promise<Configuration<any>[]>;
  findById(id: string): Promise<Configuration<any> | null>;
  findAll(queries?: any): Promise<Configuration<any>[]>;
  findOne(queries?: any): Promise<Configuration<any> | null>;
  findByIdAndUpdate(id: string, data: any): Promise<Configuration<any> | null>;
  findOneAndUpdate(queries: any, data: any): Promise<Configuration<any> | null>;
  findOneAndDelete(queries: any): Promise<void>;
}
