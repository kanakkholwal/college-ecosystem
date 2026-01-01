import type { NextFunction, Request, Response } from "express";
import express from "express";
import packageJson from "../package.json";
import { config } from "./config";
import httpRoutes from "./routes/httpRoutes";
import { checkCors } from "./utils/cors";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default route
app.get("/", (req, res) => {
  res.status(200).json({
    version: packageJson.version,
    message: "Welcome to the College Ecosystem API",
    server: "College Ecosystem API",
    data: null,
  });
});

const SERVER_IDENTITY = config.SERVER_IDENTITY;
if (!SERVER_IDENTITY) throw new Error("SERVER_IDENTITY is required in ENV");


// Middleware to handle custom CORS logic
app.use((req: Request, res: Response, next: NextFunction): void => {
  const origin = req.header("Origin") || req.header("Referrer") || "";
  const identityKey = req.header("X-Identity-Key") || "";
  const authorization = req.header("X-Authorization") || "";

  // 1. Handle preflight requests first
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin;
    if (origin && checkCors(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,PUT,DELETE");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type,X-Identity-Key,X-Authorization"
      );
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    res.status(204).end(); // Respond to preflight
    return;
  }

  // 2. Handle regular requests
  if (config.isDev)
    console.log(`Origin: ${origin}, Identity Key: ${identityKey}, Authorization: ${authorization}`);

  if (!origin) {
    console.warn("Request without origin");
    if (authorization === SERVER_IDENTITY) {
      next();
    } else {
      res.status(403).json({ error: "Missing or invalid authorization", data: null });
    }
    return;
  }

  if (authorization === SERVER_IDENTITY) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,PUT,DELETE");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type,X-Identity-Key,X-Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
  } else {
    console.warn(`CORS request from disallowed origin: ${origin}`);
    res.status(403).json({ error: "CORS policy: Invalid credentials", data: null });
  }
});
// Routes
app.use("/api", httpRoutes);

// Error handling middleware

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      message: "Something went wrong!",
      error: err.message,
    });
  }
);

// Catch-all route for undefined routes
app.use((req, res) => {
  res.status(404).json({
    message: "Not Found",
    error: "The requested resource could not be found.",
    data: null,
  });
});
export default app;