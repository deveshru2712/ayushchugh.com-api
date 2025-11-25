import { SessionModel } from "@/db/schema";
import type { NewSession, Session } from "@/db/schema";
import { logger } from "../../lib/logger";

export namespace SessionService {
  /**
   * Creates a new session in the database
   * @param payload new session
   * @returns the created session
   */
  export async function create(payload: NewSession): Promise<Session> {
    try {
      const session = await SessionModel.insertOne(payload);

      logger.audit("Created new session", {
        module: "session",
        action: "service:create",
        session: session,
      });

      return session;
    } catch (err) {
      logger.error("Error creating session", {
        module: "session",
        action: "service:create",
        error: err,
      });

      throw err;
    }
  }

  /**
   * Finds a session by refresh token
   * @param refreshToken refresh token to find by
   * @returns the found session
   */
  export async function findById(id: string): Promise<Session> {
    try {
      const session = await SessionModel.findById(id);
      return session;
    } catch (err) {
      logger.error("Error finding session by id", {
        module: "session",
        action: "service:findById",
        error: err,
      });

      throw err;
    }
  }
}
