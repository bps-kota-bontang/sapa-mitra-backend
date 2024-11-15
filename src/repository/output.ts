import { Output } from "@/model/output";

export interface OutputRepository {
  create(data: any): Promise<Output>;
  createMany(data: any[]): Promise<Output[]>;
  findById(id: string): Promise<Output | null>;
  findManyById(ids: string[]): Promise<Output[]>;
  findAll(queries?: any): Promise<Output[]>;
  update(id: string, data: any): Promise<Output | null>;
  delete(id: string): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
  findByIdAndUpdate(id: string, data: any): Promise<Output | null>;
}
