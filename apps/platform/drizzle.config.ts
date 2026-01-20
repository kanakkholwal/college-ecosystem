import { defineConfig } from "drizzle-kit";

import { loadEnvConfig } from "@next/env";



// Determine environment
const env = process.env.NODE_ENV || "development";
console.log(`🚀 Running in ${env} mode`);

// Load environment-specific .env file manually
const envFile = env === "production"
  ? ".env.production"
  : ".env.development";


// Load and expand the specific env file
const projectDir = process.cwd();
loadEnvConfig(projectDir, env !== "production");

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error(`DATABASE_URL not found in ${envFile}`);
}

console.log(`📦 Using database: ${dbUrl.split("@")[1] || "local"}`);

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./migrations",
  dbCredentials: {
    url: dbUrl,
    ssl: env === "production" ? {
      rejectUnauthorized: false,
    } : false,
  },
});