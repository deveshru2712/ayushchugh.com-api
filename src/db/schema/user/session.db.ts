import mongoose, { Schema, type HydratedDocument } from "mongoose";
import type { InferSchemaType } from "mongoose";

export enum SessionProvider {
  GOOGLE = "google",
}

export enum SessionStatus {
  ACTIVE = "active",
  REVOKED = "revoked",
  EXPIRED = "expired",
}

const sessionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    status: {
      type: String,
      enum: Object.values(SessionStatus),
      required: true,
    },

    provider: {
      type: String,
      enum: Object.values(SessionProvider),
      required: true,
    },

    providerAccessToken: { type: String, required: true },
    providerAccessTokenIv: { type: String, required: true },
    providerAccessTokenTag: { type: String, required: true },
    providerAccessTokenExpiresAt: { type: Date, required: true },

    providerRefreshToken: { type: String, required: true },
    providerRefreshTokenIv: { type: String, required: true },
    providerRefreshTokenTag: { type: String, required: true },
    providerRefreshTokenExpiresAt: { type: Date, required: true },

    providerScope: { type: String, required: true },
    providerAccountId: { type: String, required: true },

    lastAccessedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

    deletedAt: { type: Date },
    expiresAt: { type: Date, required: true },

    metadata: { type: Object, default: {} },
  },
  { timestamps: false },
);

// indexing
sessionSchema.index({ providerRefreshToken: 1 }, { unique: true });
sessionSchema.index({ providerAccountId: 1 });
sessionSchema.index({ userId: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ lastAccessedAt: 1 });
sessionSchema.index({ revokedAt: 1 });
sessionSchema.index({ expiresAt: 1 });
sessionSchema.index({ provider: 1 });

export type SessionRaw = InferSchemaType<typeof sessionSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type Session = HydratedDocument<SessionRaw>;

export const SessionModel = mongoose.models.Session || mongoose.model("Session", sessionSchema);

export type NewSession = Omit<SessionRaw, "_id" | "createdAt" | "updatedAt">;
export type UpdateSession = Partial<Omit<SessionRaw, "_id" | "createdAt">>;
