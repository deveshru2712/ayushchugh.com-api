import StatusCodes from "@/config/status-codes";
import { EducationModel } from "@/db/schema/education/education.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const deleteEducationById = factory.createHandlers(
  customZValidator(
    "param",
    z.object({
      id: z.string(),
    }),
  ),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      await EducationModel.findByIdAndDelete(id);

      return c.json({
        message: "education deleted",
      });
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

      logger.error("Error while deleting education", {
        module: "education",
        action: "education:delete:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to delete project",
      });
    }
  },
);
