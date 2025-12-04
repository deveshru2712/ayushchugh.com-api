import StatusCodes from "@/config/status-codes";
import { WorkExperienceModel } from "@/db/schema/work/work.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const addExperience = factory.createHandlers(
  customZValidator(
    "json",
    z.object({
      company: z.string(),
      logo: z.string().optional(),
      location: z.string(),
      website: z.string(),
      role: z.string(),
      startDate: z.iso.date(),
      endDate: z.iso.date().nullable(),
      isCurrent: z.boolean(),
      workType: z.string(),
      technologies: z.array(z.string()).optional().default([]),
      responsibilities: z.array(z.string()).optional().default([]),
    }),
  ),
  async (c) => {
    try {
      const {
        company,
        logo,
        location,
        website,
        role,
        startDate,
        endDate,
        isCurrent,
        workType,
        technologies,
        responsibilities,
      } = c.req.valid("json");

      const positionEntry = {
        role,
        startDate: new Date(startDate),
        endDate: isCurrent ? null : endDate ? new Date(endDate) : null,
        workType,
        technologies,
        responsibilities,
      };

      const existing = await WorkExperienceModel.findOne({ company });

      let result;

      if (existing) {
        existing.positions.push(positionEntry);
        result = await existing.save();
      } else {
        result = await WorkExperienceModel.create({
          company,
          logo,
          location,
          website,
          positions: [positionEntry],
        });
      }

      return c.json(
        {
          message: "Work Experience saved successfully",
          data: result,
        },
        StatusCodes.HTTP_201_CREATED,
      );
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

      logger.error("Error add new work experience", {
        module: "work",
        action: "work:create:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to add new work experience",
      });
    }
  },
);
