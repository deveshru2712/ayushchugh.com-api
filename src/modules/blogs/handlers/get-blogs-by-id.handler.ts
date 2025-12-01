import { BlogsModel } from "@/db/schema/blogs/blogs.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const getBlogById = factory.createHandlers(
  customZValidator(
    "param",
    z.object({
      id: z.string(),
    }),
  ),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const blog = await BlogsModel.findById(id);

      // if blog does not exists
      if (!blog) {
        throw new HTTPException(404, {
          message: "Blog not found",
        });
      }

      return c.json({
        message: "blog fetched",
        blog,
      });
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

      logger.error("Error while fetching blogs", {
        module: "blogs",
        action: "blog:fetch:error",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },
);
