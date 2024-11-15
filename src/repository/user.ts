import { User } from "@/model/user";

export interface UserRepository {
  create(data: any): Promise<User>;
  createMany(data: any[]): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findAll(queries?: any): Promise<User[]>;
  findOne(queries?: any): Promise<User | null>;
  findByIdAndUpdate(id: string, data: any): Promise<User | null>;
}
