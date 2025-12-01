import mongoose, { Schema } from "mongoose";
import type { InferSchemaType } from "mongoose";

const blogSchema = new Schema(
  {
    title: { type: String, required: true, unique: true },
    summary: { type: String, required: true },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "blogs",
  },
);

export type BlogSchemaType = InferSchemaType<typeof blogSchema>;

export const BlogsModel = mongoose.models.Blog || mongoose.model("Blog", blogSchema);
