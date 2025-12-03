import StatusCodes from "@/config/status-codes";
import { VolunteerModel } from "@/db/schema/volunteer/volunteer.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const deleteVolunteerExpById = factory.createHandlers(
  customZValidator(
    "param",
    z.object({
      id: z.string(),
    }),
  ),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const volunteerExp = await VolunteerModel.findByIdAndDelete(id);

      return c.json(
        {
          message: "Volunteer exp deleted successfully",
          volunteerExp,
        },
        StatusCodes.HTTP_200_OK,
      );
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

      logger.error("Error deleted volunteer exp", {
        module: "volunteer",
        action: "volunteer:delete:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to delete volunteer exp",
      });
    }
  },
);
