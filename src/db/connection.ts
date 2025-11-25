import mongoose from "mongoose";
import env from "@/config/env";
import { logger } from "@/lib/logger";

export async function connectDB() {
  try {
    await mongoose.connect(env.DATABASE_URL);
    logger.info("MongoDb connected successfully", {
      module: "db",
      action: "connection:connect",
    });
  } catch (error) {
    logger.error("MongoDb connection error:", {
      module: "db",
      action: "connection:connect",
      error: error,
    });
    process.exit(1);
  }
}
