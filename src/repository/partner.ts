import { Partner } from "@/model/partner";

export interface PartnerRepository {
  create(data: any): Promise<Partner>;
  createMany(data: any[]): Promise<Partner[]>;
  findById(id: string): Promise<Partner | null>;
  findAll(queries?: any): Promise<Partner[]>;
  findOne(queries?: any): Promise<Partner | null>;
  findByIdAndUpdate(id: string, data: any): Promise<Partner | null>;
  delete(id: string): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
}
