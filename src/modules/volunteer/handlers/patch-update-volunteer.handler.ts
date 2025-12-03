import StatusCodes from "@/config/status-codes";
import { VolunteerModel } from "@/db/schema/volunteer/volunteer.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const updateVolunteerExpById = factory.createHandlers(
  customZValidator(
    "param",
    z.object({
      id: z.string(),
    }),
  ),
  customZValidator(
    "json",
    z
      .object({
        organization: z.string().optional(),
        logo: z.string().optional().optional(),
        location: z.string().optional(),
        startDate: z.iso.date().optional(),
        endDate: z.iso.date().nullable().optional(),
        isCurrent: z.boolean().optional(),
        responsibilities: z.array(z.string()).optional().default([]),
      })
      .refine(
        (data) => {
          // Remove fields that are empty, undefined, or default empty arrays
          const meaningfulFields = [
            data.organization,
            data.logo,
            data.location,
            data.startDate,
            data.endDate,
            data.isCurrent,
            data.responsibilities,
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
      const { organization, logo, startDate, endDate, isCurrent, location, responsibilities } =
        c.req.valid("json");

      const { id } = c.req.valid("param");

      const volunteerExp = await VolunteerModel.findByIdAndUpdate(
        { _id: id },
        {
          organization,
          logo,
          location,
          startDate,
          endDate: isCurrent ? null : endDate,
          responsibilities,
        },
        { new: true },
      );

      return c.json(
        {
          message: "Volunteer expe updated successfully",
          volunteerExp,
        },
        StatusCodes.HTTP_200_OK,
      );
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

      logger.error("Error updated volunteer exp", {
        module: "volunteer",
        action: "volunteer:update:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to update volunteer exp",
      });
    }
  },
);
