import { User } from "@/model/user";
import { Schema, model } from "mongoose";

export const userSchema = new Schema<User>(
  {
    name: { type: String, required: true },
    nip: {
      type: String,
      required: true,
      unique: true,
      minlength: 16,
      maxlength: 16,
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    team: {
      type: String,
      required: false,
      enum: ["SOSIAL", "PRODUKSI", "DISTRIBUSI", "NERWILIS", "IPDS", "TU"],
    },
    position: {
      type: String,
      required: true,
      enum: ["ANGGOTA", "KETUA", "KEPALA"],
    },
  },
  {
    timestamps: true,
  }
);

const UserSchema = model("users", userSchema);

export default UserSchema;
