import dotenv from "dotenv";
dotenv.config({ quiet: true });

// This file contains the configuration for the server.
// It includes the server identity, port, database URL, Redis URL, and CORS settings.

function parseProxyHops(value: string | undefined): number {
  const hops = Number.parseInt(value ?? "", 10);
  return Number.isInteger(hops) && hops >= 0 ? hops : 1;
}

export const config = {
  appName: "College Platform Server",
  // The version of the application
  appVersion: "1.0.0",
  // The identity key for the server
  SERVER_IDENTITY: (process.env.SERVER_IDENTITY as string) || "",

  // The port on which the server will run
  PORT: Number.parseInt(process.env.PORT || "8080"),

  // The URL of the database
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/nith",
  // The URL of the Redis server
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",

  // Proxy hops in front of the server, so req.ip is the real client for rate limiting.
  TRUST_PROXY: parseProxyHops(process.env.TRUST_PROXY),

  isDev: process.env.NODE_ENV !== "production",
} as const;

// The localhost fallback is for development; in production it would silently point at nothing.
if (!config.isDev && !process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required in production");
}

export type Config = typeof config;
