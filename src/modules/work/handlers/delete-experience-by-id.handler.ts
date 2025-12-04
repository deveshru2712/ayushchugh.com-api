import StatusCodes from "@/config/status-codes";
import { WorkExperienceModel } from "@/db/schema/work/work.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const deleteExperienceById = factory.createHandlers(
  customZValidator(
    "param",
    z.object({
      id: z.string(),
      positionId: z.string(),
    }),
  ),

  async (c) => {
    try {
      const { id, positionId } = c.req.valid("param");

      const experience = await WorkExperienceModel.findById(id);
      if (!experience) {
        throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
          message: "Experience not found",
        });
      }

      const position = experience.positions.id(positionId);
      if (!position) {
        throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
          message: `Position with id ${positionId} does not exist`,
        });
      }

      position.deleteOne();

      let result;
      if (experience.positions.length === 0) {
        result = await WorkExperienceModel.findByIdAndDelete(id);
      } else {
        result = await experience.save();
      }

      return c.json(
        {
          message: "Position deleted successfully",
          data: result,
        },
        StatusCodes.HTTP_200_OK,
      );
    } catch (err) {
      if (err instanceof HTTPException) throw err;

      logger.error("Error while deleting work experience", {
        module: "work",
        action: "work:delete:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to delete work exp",
      });
    }
  },
);
