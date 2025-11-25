import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import env from "./src/config/env";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/**/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL!,
    ssl: env.NODE_ENV === "development" ? false : { rejectUnauthorized: false },
  },
  casing: "snake_case",
});
