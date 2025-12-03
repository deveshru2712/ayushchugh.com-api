import StatusCodes from "@/config/status-codes";
import { VolunteerModel } from "@/db/schema/volunteer/volunteer.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const addVolunteerExp = factory.createHandlers(
  customZValidator(
    "json",
    z.object({
      organization: z.string(),
      logo: z.string().optional(),
      location: z.string(),
      startDate: z.iso.date(),
      endDate: z.iso.date().nullable(),
      isCurrent: z.boolean(),
      responsibilities: z.array(z.string()).optional().default([]),
    }),
  ),
  async (c) => {
    try {
      const { organization, logo, startDate, endDate, isCurrent, location, responsibilities } =
        c.req.valid("json");

      const volunteerExp = await VolunteerModel.create({
        organization,
        logo,
        location,
        startDate,
        endDate: isCurrent ? null : endDate,
        responsibilities,
      });

      return c.json(
        {
          message: "Volunteer expe added successfully",
          volunteerExp,
        },
        StatusCodes.HTTP_201_CREATED,
      );
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

      logger.error("Error adding volunteer exp", {
        module: "volunteer",
        action: "volunteer:create:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to add new volunteer exp",
      });
    }
  },
);
