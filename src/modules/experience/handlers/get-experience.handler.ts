import StatusCodes from "@/config/status-codes";
import { ExperienceModel } from "@/db/schema/experience/experience.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { HTTPException } from "hono/http-exception";

export const getAllExperiences = factory.createHandlers(async (c) => {
  try {
    const res = await ExperienceModel.find();
    return c.json(
      {
        message: "Fetched experiences  successfully",
        data: res,
      },
      StatusCodes.HTTP_201_CREATED,
    );
  } catch (err) {
    if (err instanceof HTTPException) {
      throw err;
    }

    logger.error("Error while fetching experiences", {
      module: "experience",
      action: "experience:fetch:error",
      error: err instanceof Error ? err.message : String(err),
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch experiences",
    });
  }
});
