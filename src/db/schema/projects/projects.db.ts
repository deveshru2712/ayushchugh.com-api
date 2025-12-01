import mongoose, { Schema } from "mongoose";
import type { InferSchemaType } from "mongoose";

const projectSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  link: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    minlength: 10,
    maxlength: 300,
  },
  logo: {
    type: String,
    required: true,
  },
  techStack: {
    type: [String],
    default: [],
  },
});

export type ProjectsSchemaType = InferSchemaType<typeof projectSchema>;

export const ProjectModel = mongoose.models.Project || mongoose.model("Project", projectSchema);
