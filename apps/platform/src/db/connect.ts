import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

export const db = drizzle({
  client: new Pool({
    connectionString: process.env.DATABASE_URL,
    // Set reasonable timeouts
  }),

  casing: "snake_case",
  schema,
});
