import { createServer } from "node:http";
import app from "./app";
import {config} from "./config";


// Create HTTP server
const server = createServer(app);



// Start the server
server.listen(config.PORT, "0.0.0.0", () => {
  if (config.isDev) {
    console.log(`Running in development mode at http://localhost:${config.PORT}`);
  }
});
