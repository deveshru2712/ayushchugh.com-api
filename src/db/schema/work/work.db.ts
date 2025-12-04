import mongoose, { Schema } from "mongoose";
import type { InferSchemaType } from "mongoose";

const workExperienceSchema = new Schema(
  {
    company: { type: String, required: true },
    logo: { type: String },
    location: { type: String, required: true },
    website: { type: String, required: true },
    positions: [
      {
        role: { type: String, required: true, trim: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        workType: { type: String, required: true },
        technologies: { type: [String], default: [] },
        responsibilities: { type: [String], default: [] },
      },
    ],
  },
  { timestamps: true },
);

export type WorkExperienceSchemaType = InferSchemaType<typeof workExperienceSchema>;

export const WorkExperienceModel =
  mongoose.models.WorkExperience || mongoose.model("WorkExperience", workExperienceSchema);
