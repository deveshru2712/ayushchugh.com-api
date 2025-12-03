import StatusCodes from "@/config/status-codes";
import { BlogsModel } from "@/db/schema/blogs/blogs.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const deleteBlogById = factory.createHandlers(
  customZValidator(
    "param",
    z.object({
      id: z.string(),
    }),
  ),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const blog = await BlogsModel.findByIdAndDelete(id);

      // if blog does not exists
      if (!blog) {
        throw new HTTPException(404, {
          message: "Blog not found",
        });
      }

      return c.json({
        message: "blog deleted",
        blog,
      });
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

      logger.error("Error while deleting blogs", {
        module: "blogs",
        action: "blog:delete:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to delete blogs",
      });
    }
  },
);
