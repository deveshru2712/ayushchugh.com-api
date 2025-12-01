import mongoose, { Schema } from "mongoose";
import type { InferSchemaType } from "mongoose";

const experienceSchema = new Schema(
  {
    experienceType: {
      type: String,
      enum: ["work", "education", "volunteering"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    institute: {
      type: String,
      required: true,
      trim: true,
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export type ExperienceSchemaType = InferSchemaType<typeof experienceSchema>;

export const ExperienceModel =
  mongoose.models.Experience || mongoose.model("Experience", experienceSchema);
