import { createHash, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import packageJson from "../package.json";
import { config } from "./config";
import httpRoutes from "./routes/httpRoutes";
import { generalLimiter } from "./utils/rate-limit";

const app = express();
app.set("trust proxy", config.TRUST_PROXY);

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

// Secret managers often add a trailing newline, which would fail the exact comparison.
const SERVER_IDENTITY = config.SERVER_IDENTITY?.trim();
if (!SERVER_IDENTITY) throw new Error("SERVER_IDENTITY is required in ENV");
const IDENTITY_BUFFER = Buffer.from(SERVER_IDENTITY);

/** Length and hash prefix, so logs can show two secrets differ without revealing either. */
function fingerprint(value: string): string {
  if (!value) return "none";
  const hash = createHash("sha256").update(value).digest("hex").slice(0, 8);
  return `len=${value.length} sha256=${hash}`;
}
console.info(`[identity] expecting ${fingerprint(SERVER_IDENTITY)}`);

function hasServerIdentity(header: string): boolean {
  const given = Buffer.from(header.trim());
  return (
    given.length === IDENTITY_BUFFER.length &&
    timingSafeEqual(given, IDENTITY_BUFFER)
  );
}

// Only the platform's server side calls this API (browser streams and uploads go through its
// admin-checked routes), so every /api request must carry the identity. Origin is spoofable.
app.use("/api", (req: Request, res: Response, next: NextFunction): void => {
  const authorization = req.header("X-Authorization") || "";
  if (hasServerIdentity(authorization)) {
    next();
    return;
  }
  console.warn(
    `[identity] rejected ${req.method} ${req.path}: got ${fingerprint(authorization.trim())}, expected ${fingerprint(SERVER_IDENTITY)}`
  );
  res.status(403).json({
    error: true,
    message: "Missing or invalid authorization",
    data: null,
  });
});
// After the identity check, so X-Client-Id is only trusted from the platform.
app.use("/api", generalLimiter);
// Routes
app.use("/api", httpRoutes);

// Error handling middleware

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    // biome-ignore lint/correctness/noUnusedFunctionParameters: express error handler needs the 4th arg
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    // Body-parser errors carry a 4xx status and a safe message; anything else stays internal.
    const status = (err as { status?: number }).status;
    const clientError =
      typeof status === "number" && status >= 400 && status < 500;
    res.status(clientError ? status : 500).json({
      message: clientError ? err.message : "Something went wrong!",
      error: true,
      data: null,
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
