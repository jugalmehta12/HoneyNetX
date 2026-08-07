require("dotenv").config();

const app = require("./app");
const config = require("./config");
const { connectDatabase, disconnectDatabase } = require("./config/database");

let server;

const startServer = async () => {
  await connectDatabase();

  server = app.listen(config.port, () => {
    console.log(
      `HoneyNetX server running in ${config.nodeEnv} mode on port ${config.port}`
    );
  });
};

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");
      await disconnectDatabase();
      process.exit(0);
    });
  } else {
    await disconnectDatabase();
    process.exit(0);
  }

  // Force exit after 10s if graceful shutdown stalls
  setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  shutdown("uncaughtException");
});

startServer();

module.exports = server;
