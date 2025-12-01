import { SessionService } from "@/db/services/session.service";
import { SessionModel, SessionStatus } from "@/db/schema";
import type { Session } from "@/db/schema";
import type { UpdateSession } from "@/db/schema";
import { oauthProviderFactory } from "@/modules/auth/providers";
import { encrypt, decrypt } from "@/lib/encryption";
import { logger } from "@/lib/logger";
import { signJwt } from "@/lib/jwt";

export interface TokenRefreshResult {
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken?: string;
  refreshTokenExpiresAt?: Date;
}

export namespace TokenService {
  /**
   * Check if access token is expired or about to expire (within 5 minutes)
   * @param session - Session object with token expiration
   * @returns true if token is expired or expiring soon
   */
  export function isAccessTokenExpired(session: { providerAccessTokenExpiresAt: Date }): boolean {
    const now = new Date();
    const expiresAt = new Date(session.providerAccessTokenExpiresAt);
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes buffer

    return expiresAt <= fiveMinutesFromNow;
  }

  /**
   * Check if refresh token is expired
   * @param session - Session object with refresh token expiration
   * @returns true if refresh token is expired
   */
  export function isRefreshTokenExpired(session: { providerRefreshTokenExpiresAt: Date }): boolean {
    const now = new Date();
    const expiresAt = new Date(session.providerRefreshTokenExpiresAt);

    return expiresAt <= now;
  }

  /**
   * Get a valid access token for a session, refreshing if necessary
   * @param sessionId - Session ID
   * @returns Valid access token
   */
  export async function getValidAccessToken(sessionId: string): Promise<string> {
    const session = await SessionService.findById(sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.status !== SessionStatus.ACTIVE) {
      throw new Error("Session is not active");
    }

    // Check if access token is still valid
    if (!isAccessTokenExpired(session)) {
      // Decrypt and return existing access token
      return decrypt(
        session.providerAccessToken,
        session.providerAccessTokenIv,
        session.providerAccessTokenTag,
      );
    }

    // Access token expired, refresh it
    logger.info("Access token expired, refreshing", {
      module: "auth",
      action: "token:refresh",
      sessionId,
    });

    const refreshResult = await refreshAccessToken(sessionId);

    return refreshResult.accessToken;
  }

  /**
   * Refresh access token using refresh token
   * @param sessionId - Session ID
   * @returns New access token and expiration
   */
  export async function refreshAccessToken(sessionId: string): Promise<TokenRefreshResult> {
    const session: Session = await SessionService.findById(sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.status !== SessionStatus.ACTIVE) {
      throw new Error("Session is not active");
    }

    // Check if refresh token is expired
    if (isRefreshTokenExpired(session)) {
      // Mark session as expired
      await SessionModel.findByIdAndUpdate(session._id, { status: SessionStatus.EXPIRED });

      logger.warn("Refresh token expired, session marked as expired", {
        module: "auth",
        action: "token:refresh:expired",
        sessionId,
      });

      throw new Error("Refresh token expired. Please re-authenticate.");
    }

    try {
      // Decrypt refresh token
      const refreshToken = decrypt(
        session.providerRefreshToken,
        session.providerRefreshTokenIv,
        session.providerRefreshTokenTag,
      );

      // Get OAuth provider
      const oauthProvider = oauthProviderFactory.getProvider(session.provider);

      // Refresh access token
      const tokenResponse = await oauthProvider.refreshAccessToken(refreshToken);

      if (!tokenResponse.access_token) {
        throw new Error("Token refresh response missing access_token");
      }

      // Encrypt new access token
      const {
        data: encryptedAccessToken,
        iv: accessTokenIv,
        tag: accessTokenTag,
      } = encrypt(tokenResponse.access_token);

      // Calculate new expiration
      const accessTokenExpiresIn = tokenResponse.expires_in || 3600; // Default 1 hour
      const accessTokenExpiresAt = new Date(Date.now() + accessTokenExpiresIn * 1000);

      const payload: UpdateSession = {};

      if (tokenResponse.scope) {
        payload.providerScope = tokenResponse.scope;
      }

      if (tokenResponse.refresh_token) {
        const {
          data: encryptedRefreshToken,
          iv: refreshTokenIv,
          tag: refreshTokenTag,
        } = encrypt(tokenResponse.refresh_token);

        const refreshTokenExpiresAt = new Date(
          Date.now() + (tokenResponse.expires_in || 90 * 24 * 60 * 60) * 1000,
        );

        payload.providerRefreshToken = encryptedRefreshToken;
        payload.providerRefreshTokenIv = refreshTokenIv;
        payload.providerRefreshTokenTag = refreshTokenTag;
        payload.providerRefreshTokenExpiresAt = refreshTokenExpiresAt;
      }

      payload.providerAccessToken = encryptedAccessToken;
      payload.providerAccessTokenIv = accessTokenIv;
      payload.providerAccessTokenTag = accessTokenTag;
      payload.providerAccessTokenExpiresAt = accessTokenExpiresAt;
      payload.lastAccessedAt = new Date();
      payload.updatedAt = new Date();

      // Update session with new access token
      await SessionModel.findByIdAndUpdate(session._id, payload);

      logger.audit("Access token refreshed successfully", {
        module: "auth",
        action: "token:refresh:success",
        sessionId,
      });

      const accessToken = signJwt(
        {
          userId: session.userId,
          sessionId: session._id,
        },
        {
          expiresIn: "1h",
        },
      );

      return {
        accessToken: accessToken,
        accessTokenExpiresAt,
        refreshToken: tokenResponse.refresh_token,
        refreshTokenExpiresAt: payload.providerRefreshTokenExpiresAt,
      };
    } catch (err) {
      logger.error("Error refreshing access token", {
        module: "auth",
        action: "token:refresh:error",
        sessionId,
        error: err instanceof Error ? err.message : String(err),
      });

      // Mark session as revoked if refresh failed

      const payload: UpdateSession = {};
      payload.status = SessionStatus.REVOKED;
      payload.revokedAt = new Date();
      payload.updatedAt = new Date();

      await SessionModel.findByIdAndUpdate(session._id, payload);

      throw err;
    }
  }
}
