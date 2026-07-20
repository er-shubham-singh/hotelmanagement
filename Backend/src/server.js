import http from "http";
import mongoose from "mongoose";
import app from "./app.js";
import { config } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { initSocket } from "./config/socket.js";
import { startJobs, stopJobs } from "./jobs/index.js";

const httpServer = http.createServer(app);

const start = async () => {
  await connectDB();
  initSocket(httpServer);
  startJobs();

  httpServer.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] StayByHour API running on http://localhost:${config.port} (${config.nodeEnv})`);
  });
};

const shutdown = async (signal) => {
  // eslint-disable-next-line no-console
  console.log(`[server] ${signal} received — shutting down gracefully`);
  stopJobs();
  await new Promise((resolve) => httpServer.close(resolve));
  await mongoose.disconnect();
  // eslint-disable-next-line no-console
  console.log("[server] Shutdown complete");
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start();
