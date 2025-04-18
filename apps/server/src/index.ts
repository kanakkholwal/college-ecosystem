import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import socketServers from "./routes/socketRoutes";

const PORT = Number.parseInt(process.env.PORT || "") || 8080;

// Create HTTP server
const server = createServer(app);

const CORS_ORIGINS = ["nith.eu.org", "app.nith.eu.org"];

const SERVER_IDENTITY = process.env.SERVER_IDENTITY;
if (!SERVER_IDENTITY) throw new Error("SERVER_IDENTITY is required in ENV");

// Initialize socket servers
for (const socket_server in socketServers) {
  const { path, handler } = socketServers[socket_server];

  const io = new SocketIOServer(server, {
    path,
    allowRequest: (req, callback) => {
      const origin = req.headers.origin || "";
      const identityKey = req.headers["X-IDENTITY-KEY"] || "";
      if (!origin) {
        callback(null, false);
        if (!origin) {
          // Enforce SERVER_IDENTITY for server-to-server API calls
          if (identityKey === SERVER_IDENTITY) {
            return callback(null, true);
          }
          return callback("Missing or invalid SERVER_IDENTITY", false);
        }
      } else if (
        (process.env.NODE_ENV === "production" &&
          CORS_ORIGINS.some((o) => origin.endsWith(o))) ||
        (process.env.NODE_ENV !== "production" &&
          origin.startsWith("http://localhost:"))
      ) {
        callback(null, true);
      } else {
        callback("Not allowed by CORS", false);
      }
    },
    cors: {
      origin: [
        "app.nith.eu.org",
        ...[process.env.NODE_ENV !== "production" && "http://localhost:3000"],
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  if (process.env.NODE_ENV !== "production") {
    io.engine.on("initial_headers", (headers) => {
      headers["Access-Control-Allow-Origin"] = "http://localhost:3000";
      headers["Access-Control-Allow-Credentials"] = true;
    });

    io.engine.on("headers", (headers) => {
      headers["Access-Control-Allow-Origin"] = "http://localhost:3000";
      headers["Access-Control-Allow-Credentials"] = true;
    });
  }

  io.on("connection", handler(io));
}

// Start the server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
