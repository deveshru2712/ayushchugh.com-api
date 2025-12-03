import StatusCodes from "@/config/status-codes";
import { WorkExperienceModel } from "@/db/schema/work/work.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const getExperienceById = factory.createHandlers(
  customZValidator(
    "param",
    z.object({
      id: z.string(),
    }),
  ),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const experience = await WorkExperienceModel.findById(id);

      // if experience does not exists
      if (!experience) {
        throw new HTTPException(404, {
          message: "Experience not found",
        });
      }

      return c.json({
        message: "Experience fetched",
        experience,
      });
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

      logger.error("Error while fetching work Experience", {
        module: "work",
        action: "work:fetch:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to fetch experience by id",
      });
    }
  },
);
