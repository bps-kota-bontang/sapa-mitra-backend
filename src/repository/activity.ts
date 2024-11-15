import { Activity } from "@/model/activity";

export interface ActivityRepository {
  create(data: any): Promise<Activity>;
  createMany(data: any[]): Promise<Activity[]>;
  findById(id: string): Promise<Activity | null>;
  findManyById(ids: string[]): Promise<Activity[]>;
  findAll(queries?: any): Promise<Activity[]>;
  update(id: string, data: any): Promise<Activity | null>;
  delete(id: string): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
}
