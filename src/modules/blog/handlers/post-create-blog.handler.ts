import StatusCodes from "@/config/status-codes";
import { BlogsModel } from "@/db/schema/blogs/blogs.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const createBlog = factory.createHandlers(
  customZValidator(
    "json",
    z.object({
      title: z.string().min(3, "Title must be atleast of 3 characters"),
      summary: z.string().min(3, "Summary must be atleast of 3 characters"),
      content: z.string().min(3, "Content must be atleast of 3 characters"),
    }),
  ),
  async (c) => {
    try {
      const { title, summary, content } = c.req.valid("json");

      await BlogsModel.create({ title: title, summary: summary, content: content });

      return c.json({ message: "Blog created successfully" }, StatusCodes.HTTP_201_CREATED);
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

      logger.error("Error creating new blog", {
        module: "blogs",
        action: "blog:create:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to create blog",
      });
    }
  },
);
