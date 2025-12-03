import StatusCodes from "@/config/status-codes";
import { VolunteerModel } from "@/db/schema/volunteer/volunteer.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { HTTPException } from "hono/http-exception";

export const getVolunteerExp = factory.createHandlers(async (c) => {
  try {
    const volunteerExps = await VolunteerModel.find();

    return c.json(
      {
        message: "Volunteer exp fetched successfully",
        volunteerExps,
      },
      StatusCodes.HTTP_200_OK,
    );
  } catch (err) {
    if (err instanceof HTTPException) {
      throw err;
    }

    logger.error("Error fetching volunteer exp", {
      module: "volunteer",
      action: "volunteer:fetch:error",
      error: err instanceof Error ? err.message : String(err),
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch volunteer exp",
    });
  }
});
