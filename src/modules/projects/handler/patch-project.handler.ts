import StatusCodes from "@/config/status-codes";
import { ProjectModel } from "@/db/schema/projects/projects.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const updateProjectById = factory.createHandlers(
  customZValidator("param", z.object({ id: z.string() })),
  customZValidator(
    "json",
    z
      .object({
        title: z
          .string()
          .min(3, { message: "Title must be at least 3 characters" })
          .max(50, { message: "Title cannot exceed 50 characters" })
          .optional(),
        logo: z.string().optional(),
        description: z
          .string()
          .min(10, "Description must be at least 10 characters")
          .max(300, "Description cannot exceed 300 characters")
          .optional(),
        techStack: z.array(z.string()).optional(),
        link: z.string().optional(),
        type: z.string().optional(),
      })
      .refine(
        (data) => {
          // Remove fields that are empty, undefined, or default empty arrays
          const meaningfulFields = [
            data.title,
            data.description,
            data.link,
            data.logo,
            data.techStack,
            data.type,
          ];

          return meaningfulFields.some((v) => v !== undefined && v !== null);
        },
        {
          message: "At least one field must be provided to update experience",
        },
      ),
  ),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const { title, description, link, logo, techStack, type } = c.req.valid("json");

      const project = await ProjectModel.findById(id);
      if (!project) {
        throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
          message: "resource not found",
        });
      }

      const updateFields: Partial<{
        title: string;
        description: string;
        link: string;
        logo: string;
        techStack: string[];
        type: string;
      }> = {};

      if (title) updateFields.title = title;
      if (description) updateFields.description = description;
      if (link) updateFields.link = link;
      if (logo) updateFields.logo = logo;
      if (techStack) updateFields.techStack = techStack;
      if (type) updateFields.type = type;

      const res = await ProjectModel.findByIdAndUpdate({ _id: id }, updateFields, {
        new: true,
      });

      return c.json(
        {
          message: "Project updated successfully",
          data: res,
        },
        StatusCodes.HTTP_200_OK,
      );
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

      logger.error("Error updating project", {
        module: "projects",
        action: "projects:update:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to update project",
      });
    }
  },
);
