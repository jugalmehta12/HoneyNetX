const config = require("../config");
const logger = require("../utils/logger");

/**
 * Centralized error handler middleware.
 * Logs all unexpected server errors to error.log with stack trace,
 * request path, HTTP method, and timestamp.
 */
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log to error.log via Winston
  logger.error("Unhandled server error", {
    statusCode,
    message,
    stack: err.stack,
    method: req.method,
    path: req.originalUrl || req.url,
    ip: req.ip || req.connection?.remoteAddress,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
