import dotenv from "dotenv";
dotenv.config();

// This file contains the configuration for the server.
// It includes the server identity, port, database URL, Redis URL, and CORS settings.

export const config = {
    appName: "College Platform Server",
    // The version of the application
    appVersion: "1.0.0",
    // The identity key for the server
    SERVER_IDENTITY: process.env.SERVER_IDENTITY as string || "",
    
    // The port on which the server will run
    PORT: Number.parseInt(process.env.PORT || "8080"),

    // The URL of the database
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/nith",
    // The URL of the Redis server
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",


    corsOrigins: ["https://nith.eu.org", "https://app.nith.eu.org"],
    corsEnabled: process.env.CORS_ENABLED === "true",
    isDev : process.env.NODE_ENV !== "production",
} as const;

export type Config = typeof config;