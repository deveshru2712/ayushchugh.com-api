import mongoose, { Schema, type HydratedDocument } from "mongoose";
import type { InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: false,
    },
    avatar: {
      type: String,
      required: false,
    },
    providerAccountId: {
      type: String,
      required: true,
      unique: true,
    },
    deletedAt: {
      type: Date,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "users",
  },
);

export type UserRaw = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type User = HydratedDocument<UserRaw>;

export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

export type NewUser = Omit<UserRaw, "_id" | "createdAt" | "updatedAt">;
export type UpdateUser = Partial<NewUser>;
