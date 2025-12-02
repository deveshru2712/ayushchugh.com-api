import { ProjectModel } from "@/db/schema/projects/projects.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const getProjectById = factory.createHandlers(
  customZValidator(
    "param",
    z.object({
      id: z.string(),
    }),
  ),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const project = await ProjectModel.findById(id);

      // if projects does not exists
      if (!project) {
        throw new HTTPException(404, {
          message: "project not found",
        });
      }

      return c.json({
        message: "project fetched",
        project,
      });
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

      logger.error("Error while fetching project", {
        module: "projects",
        action: "project:fetch:error",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },
);
