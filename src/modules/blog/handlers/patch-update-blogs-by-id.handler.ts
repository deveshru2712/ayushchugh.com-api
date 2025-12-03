import StatusCodes from "@/config/status-codes";
import { BlogsModel } from "@/db/schema/blogs/blogs.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const updateBlogById = factory.createHandlers(
  customZValidator("param", z.object({ id: z.string() })),
  customZValidator(
    "json",
    z
      .object({
        title: z.string().min(3, "Title must be atleast of 3 characters").optional(),
        summary: z.string().min(3, "Summary must be atleast of 3 characters").optional(),
        content: z.string().min(3, "Content must be atleast of 3 characters").optional(),
      })
      .refine((data) => data.title || data.summary || data.content, {
        message: "At least one field (title, summary, or content) must be provided",
      }),
  ),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const { title, summary, content } = c.req.valid("json");

      const blog = await BlogsModel.findById(id);
      if (!blog) {
        throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
          message: "resource not found",
        });
      }

      const updateFields: Partial<{ title: string; summary: string; content: string }> = {};
      if (title) updateFields.title = title;
      if (summary) updateFields.summary = summary;
      if (content) updateFields.content = content;

      const res = await BlogsModel.findByIdAndUpdate({ _id: id }, updateFields, { new: true });

      return c.json({ message: "Blog updated successfully", res }, StatusCodes.HTTP_200_OK);
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

      logger.error("Error updating  blog", {
        module: "blogs",
        action: "blog:update:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to update blog",
      });
    }
  },
);
