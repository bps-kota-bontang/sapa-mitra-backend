import { User } from "@/model/user";

export interface UserRepository {
  findOne(): Promise<User | null>;
}
