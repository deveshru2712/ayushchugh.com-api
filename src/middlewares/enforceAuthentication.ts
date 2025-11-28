import StatusCodes from "@/config/status-codes";
import { SessionModel, SessionStatus, UserModel } from "@/db/schema";
import type { Session } from "@/db/schema";
import { verifyJwt } from "@/lib/jwt";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

export const authValidator = createMiddleware(async (c, next) => {
  // Extract access token from cookies
  const accessToken = getCookie(c, "accessToken");

  // checking if accesstoken exists
  if (!accessToken) {
    throw new HTTPException(StatusCodes.HTTP_401_UNAUTHORIZED, {
      message: "Access token not provided",
    });
  }

  let decoded: { userId: string; sessionId: string } | null = null;

  // Verify JWT token
  try {
    decoded = verifyJwt(accessToken, {
      algorithms: ["HS256"],
    }) as { userId: string; sessionId: string };
  } catch {
    throw new HTTPException(StatusCodes.HTTP_401_UNAUTHORIZED, {
      message: "Invalid or expired access token",
    });
  }

  // Validate token payload
  if (!decoded?.userId || !decoded?.sessionId) {
    throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
      message: "Invalid access token payload",
    });
  }

  const session: Session | null = await SessionModel.findOne({
    _id: decoded.sessionId,
    userId: decoded.userId,
  });

  // session is not found
  if (!session) {
    throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
      message: "Session not found",
    });
  }

  // if session has expired
  if (session.expiresAt <= new Date()) {
    throw new HTTPException(StatusCodes.HTTP_401_UNAUTHORIZED, {
      message: "Session expired",
    });
  }

  // if session status is not active
  if (session.status !== SessionStatus.ACTIVE) {
    throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
      message: "Session revoked or inactive",
    });
  }

  // fetching the user
  const user = await UserModel.findById(decoded.userId);

  // checking if user exists
  if (!user) {
    throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
      message: "User not found",
    });
  }

  // Update last accessed time
  await SessionModel.updateOne({ _id: session._id }, { lastAccessedAt: new Date() });

  c.set("user", user);
  c.set("sessionId", session._id.toString());

  await next();
});
