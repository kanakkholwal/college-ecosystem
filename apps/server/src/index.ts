import { createServer } from "node:http";
import app from "./app";
import { config } from "./config";

// Express 4 doesn't catch rejected async handlers; log them instead of letting Node exit.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

// Create HTTP server
const server = createServer(app);

// Start the server
server.listen(config.PORT, "0.0.0.0", () => {
  if (config.isDev) {
    console.log(
      `Running in development mode at http://localhost:${config.PORT}`
    );
  }
});
