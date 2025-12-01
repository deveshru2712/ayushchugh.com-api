import { factory } from "@/lib/factory";
import { HTTPException } from "hono/http-exception";
import StatusCodes from "@/config/status-codes";
import { TokenService } from "../services";
import { logger } from "@/lib/logger";
import { getCookie, setCookie } from "hono/cookie";
import { verifyJwt } from "@/lib/jwt";
import env from "@/config/env";

export const postRefreshTokenHandler = factory.createHandlers(async (c) => {
  try {
    const refreshToken = getCookie(c, "refreshToken");

    if (!refreshToken) {
      throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
        message: "Refresh token not provided",
      });
    }

    let decoded: { userId: string; sessionId: string };

    try {
      decoded = verifyJwt(refreshToken, {
        algorithms: ["HS256"],
      }) as { userId: string; sessionId: string };
    } catch {
      throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
        message: "Invalid or expired refresh token",
      });
    }

    const { sessionId } = decoded;

    // Refresh access token
    const result = await TokenService.refreshAccessToken(sessionId);

    logger.audit("Access token refreshed", {
      module: "auth",
      action: "token:refresh:success",
      sessionId,
    });

    // setting the accesstoken
    setCookie(c, "accessToken", result.accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 60 * 60,
      path: "/",
    });

    if (result.refreshToken) {
      setCookie(c, "refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 60 * 60 * 24 * 90,
        path: "/",
      });
    }

    return c.json({
      message: "Token refreshed successfully",
      accessToken: result.accessToken,
    });
  } catch (err) {
    if (err instanceof HTTPException) {
      throw err;
    }

    logger.error("Error refreshing token", {
      module: "auth",
      action: "token:refresh:error",
      error: err instanceof Error ? err.message : String(err),
    });
  }
});
