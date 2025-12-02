import StatusCodes from "@/config/status-codes";
import { ExperienceModel } from "@/db/schema/experience/experience.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";
import { ZodExperienceType } from "@/modules/experience/handlers/post-add-experience.handler";

export const updateExperienceById = factory.createHandlers(
  customZValidator("param", z.object({ id: z.string() })),
  customZValidator(
    "json",
    z
      .object({
        experienceType: ZodExperienceType.optional(),
        title: z
          .string()
          .min(3, { message: "Title must be at least 3 characters" })
          .max(50, { message: "Title cannot exceed 50 characters" })
          .optional(),
        position: z
          .string()
          .min(3, "Position must be at least 3 characters")
          .max(30, "Position cannot exceed 30 characters")
          .optional(),
        institute: z
          .string()
          .min(3, "Institute must be at least 3 characters")
          .max(50, "Institute cannot exceed 50 characters")
          .optional(),

        startDate: z.iso.date().optional(),

        endDate: z.iso.date().nullable().optional(),

        isCurrent: z.boolean().optional(),

        skills: z.array(z.string()).optional().default([]),
        responsibilities: z.array(z.string()).optional().default([]),
      })
      .refine(
        (data) => {
          // Remove fields that are empty, undefined, or default empty arrays
          const meaningfulFields = [
            data.title,
            data.position,
            data.institute,
            data.startDate,
            data.endDate,
            data.isCurrent,
            data.skills?.length ? data.skills : null,
            data.responsibilities?.length ? data.responsibilities : null,
          ];

          return meaningfulFields.some((v) => v !== undefined && v !== null);
        },
        {
          message: "At least one field must be provided to update experience",
        },
      )
      .refine(
        (data) => {
          // If isCurrent is explicitly set to false, endDate must be provided
          if (data.isCurrent === false && !data.endDate) {
            return false;
          }
          return true;
        },
        {
          message: "End date must be provided when isCurrent is false",
        },
      ),
  ),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
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

      const experience = await ExperienceModel.findById(id);
      if (!experience) {
        throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
          message: "resource not found",
        });
      }

      const updateFields: Partial<{
        experienceType: z.infer<typeof ZodExperienceType>;
        title: string;
        position: string;
        institute: string;
        skills: string[];
        responsibilities: string[];
        startDate: Date;
        endDate: Date | null;
        isCurrent: boolean;
      }> = {};

      if (experienceType != undefined) {
        const validTypes = ["work", "education", "volunteering"] as const;
        if (validTypes.includes(experienceType)) {
          updateFields.experienceType = experienceType;
        }
      }
      if (title) updateFields.title = title;
      if (position) updateFields.position = position;
      if (institute) updateFields.institute = institute;
      if (responsibilities) updateFields.responsibilities = responsibilities;
      if (skills) updateFields.skills = skills;
      if (startDate) updateFields.startDate = new Date(startDate);
      if (endDate !== undefined) updateFields.endDate = endDate ? new Date(endDate) : null;
      if (isCurrent) updateFields.endDate = null;
      const res = await ExperienceModel.findByIdAndUpdate({ _id: id }, updateFields, {
        new: true,
      });

      return c.json(
        {
          message: "Experience updated successfully",
          data: res,
        },
        StatusCodes.HTTP_200_OK,
      );
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

      logger.error("Error updating experience", {
        module: "experience",
        action: "experience:update:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to update experience",
      });
    }
  },
);
