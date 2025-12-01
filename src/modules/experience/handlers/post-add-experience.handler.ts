import StatusCodes from "@/config/status-codes";
import { ExperienceModel } from "@/db/schema/experience/experience.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const ZodExperienceType = z.enum(["work", "education", "volunteering"]);

export const addExperience = factory.createHandlers(
  customZValidator(
    "json",
    z.object({
      experienceType: ZodExperienceType,
      title: z
        .string()
        .min(3, { message: "Title must be at least 3 characters" })
        .max(50, { message: "Title cannot exceed 50 characters" }),
      position: z
        .string()
        .min(3, "Position must be at least 3 characters")
        .max(30, "Position cannot exceed 30 characters"),
      institute: z
        .string()
        .min(3, "Institute must be at least 3 characters")
        .max(50, "Institute cannot exceed 50 characters"),

      startDate: z.iso.date(),

      endDate: z.iso.date().nullable(),

      isCurrent: z.boolean(),

      skills: z.array(z.string()).optional().default([]),
      responsibilities: z.array(z.string()).optional().default([]),
    }),
  ),
  async (c) => {
    try {
      const {
        experienceType,
        title,
        position,
        responsibilities,
        skills,
        startDate,
        endDate,
        institute,
        isCurrent,
      } = c.req.valid("json");

      const res = await ExperienceModel.create({
        experienceType,
        title,
        position,
        responsibilities,
        skills,
        startDate: new Date(startDate),
        endDate: isCurrent ? null : endDate ? new Date(endDate) : null,
        institute,
      });

      return c.json(
        {
          message: "Experience added successfully",
          data: res,
        },
        StatusCodes.HTTP_201_CREATED,
      );
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

      logger.error("Error add new experience", {
        module: "experience",
        action: "experience:create:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to create experience",
      });
    }
  },
);
