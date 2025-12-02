import StatusCodes from "@/config/status-codes";
import { ProjectModel } from "@/db/schema/projects/projects.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { HTTPException } from "hono/http-exception";

export const getAllProjects = factory.createHandlers(async (c) => {
  try {
    const projects = await ProjectModel.find();
    return c.json({
      message: "Fetched all projects successfully",
      projects,
    });
  } catch (err) {
    if (err instanceof HTTPException) {
      throw err;
    }

    logger.error("Error while fetching projects", {
      module: "experience",
      action: "experience:fetch:error",
      error: err instanceof Error ? err.message : String(err),
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      message: "Failed to create experience",
    });
  }
});
