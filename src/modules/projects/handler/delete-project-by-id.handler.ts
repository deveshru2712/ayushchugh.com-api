import StatusCodes from "@/config/status-codes";
import { ProjectModel } from "@/db/schema/projects/projects.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const deleteProjectById = factory.createHandlers(
  customZValidator(
    "param",
    z.object({
      id: z.string(),
    }),
  ),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const project = await ProjectModel.findByIdAndDelete(id);

      return c.json({
        message: "project deleted",
        project,
      });
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

      logger.error("Error while deleting project", {
        module: "project",
        action: "project:delete:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to delete project",
      });
    }
  },
);
