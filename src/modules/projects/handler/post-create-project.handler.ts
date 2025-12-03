import StatusCodes from "@/config/status-codes";
import { ProjectModel } from "@/db/schema/projects/projects.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const createProject = factory.createHandlers(
  customZValidator(
    "json",
    z.object({
      title: z
        .string()
        .min(3, { message: "Title must be at least 3 characters" })
        .max(50, { message: "Title cannot exceed 50 characters" }),
      description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(300, "Description cannot exceed 300 characters"),
      logo: z.string(),
      link: z.string(),
      techStack: z.array(z.string()),
      workType: z.string(),
      category: z.string(),
    }),
  ),
  async (c) => {
    try {
      const { title, description, link, logo, techStack, category, workType } = c.req.valid("json");

      const res = await ProjectModel.create({
        title,
        description,
        link,
        logo,
        techStack,
        category,
        workType,
      });
      return c.json(
        {
          message: "Project added successfully",
          data: res,
        },
        StatusCodes.HTTP_201_CREATED,
      );
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

      logger.error("Error add new project", {
        module: "projects",
        action: "projects:create:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to create project",
      });
    }
  },
);
