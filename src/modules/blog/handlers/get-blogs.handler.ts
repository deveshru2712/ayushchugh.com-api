import StatusCodes from "@/config/status-codes";
import { BlogsModel } from "@/db/schema/blogs/blogs.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { HTTPException } from "hono/http-exception";

export const getAllBlogs = factory.createHandlers(async (c) => {
  try {
    const blogs = await BlogsModel.find();

    return c.json({
      message: "blogs fetched",
      blogs,
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

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch blogs",
    });
  }
});
