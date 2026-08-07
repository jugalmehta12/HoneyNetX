const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (config.nodeEnv === "development") {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} - ${message}`);
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === "development" && { stack: err.stack }),
  });
};

const config = require("../config");

module.exports = errorHandler;
