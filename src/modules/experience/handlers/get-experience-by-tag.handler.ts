import StatusCodes from "@/config/status-codes";
import { ExperienceModel } from "@/db/schema/experience/experience.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";
import { ZodExperienceType } from "@/modules/experience/handlers/post-add-experience.handler";

export const getExperienceByTag = factory.createHandlers(
  customZValidator(
    "param",
    z.object({
      tag: ZodExperienceType,
    }),
  ),
  async (c) => {
    try {
      const { tag } = c.req.valid("param");
      const res = await ExperienceModel.find({ experienceType: tag });

      return c.json(
        {
          message: "Fetched experiences by tag successfully",
          data: res,
        },
        StatusCodes.HTTP_201_CREATED,
      );
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

      logger.error("Error while fetching experience by tag", {
        module: "experience",
        action: "experience:fetch:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to fetch experience by tag",
      });
    }
  },
);
