import StatusCodes from "@/config/status-codes";
import { WorkExperienceModel } from "@/db/schema/work/work.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { HTTPException } from "hono/http-exception";

export const getAllExperiences = factory.createHandlers(async (c) => {
  try {
    const experiences = await WorkExperienceModel.find().lean();

    experiences.forEach((exp) => {
      if (exp.positions) {
        exp.positions.sort(
          (a: { startDate: Date }, b: { startDate: Date }) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
        );
      }
    });

    experiences.sort((a, b) => {
      const aLatest = a.positions?.[0]?.startDate
        ? new Date(a.positions[0].startDate).getTime()
        : 0;

      const bLatest = b.positions?.[0]?.startDate
        ? new Date(b.positions[0].startDate).getTime()
        : 0;

      return bLatest - aLatest;
    });

    return c.json(
      {
        message: "Fetched experiences successfully",
        experiences,
      },
      StatusCodes.HTTP_200_OK,
    );
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error while fetching work experiences", {
      module: "work",
      action: "work:fetch:error",
      error: err instanceof Error ? err.message : String(err),
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch experiences",
    });
  }
});
