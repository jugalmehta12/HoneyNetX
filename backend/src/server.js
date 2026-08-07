require("dotenv").config();

const app = require("./app");
const config = require("./config");
const { connectDatabase, disconnectDatabase } = require("./config/database");
const logger = require("./utils/logger");
const ingestionConfig = require("./config/ingestion");
const { createLogWatcher } = require("./services/ingestion/logWatcher");
const { processLine } = require("./events/eventProcessor");

let server;
let logWatcher;

const startServer = async () => {
  await connectDatabase();

  // ── Start log ingestion if enabled ─────────────────────────────
  if (ingestionConfig.enabled) {
    logWatcher = createLogWatcher((line) => {
      // Fire and forget — processLine handles its own errors
      processLine(line).catch((err) => {
        logger.error("Ingestion: unexpected error in processLine", { error: err.message });
      });
    });
    logWatcher.startWatching();
    logger.info("Log ingestion enabled", { logPath: ingestionConfig.logPath });
  } else {
    logger.info("Log ingestion disabled (set INGESTION_ENABLED=true to enable)");
  }

  server = app.listen(config.port, () => {
    logger.info(`HoneyNetX server running in ${config.nodeEnv} mode on port ${config.port}`);
  });
};

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  // Stop log ingestion before closing the server
  if (logWatcher && logWatcher.isRunning) {
    logWatcher.stopWatching();
    logger.info("Log ingestion stopped.");
  }

  if (server) {
    server.close(async () => {
      logger.info("HTTP server closed.");
      await disconnectDatabase();
      logger.close();
      process.exit(0);
    });
  } else {
    await disconnectDatabase();
    logger.close();
    process.exit(0);
  }

  // Force exit after 10s if graceful shutdown stalls
  setTimeout(() => {
    logger.error("Forced shutdown after timeout.");
    logger.close();
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", { reason: String(reason) });
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", { message: err.message, stack: err.stack });
  shutdown("uncaughtException");
});

startServer();

module.exports = server;
