const logger = require("../utils/logger");

/**
 * Express middleware that logs every incoming HTTP request to the access log.
 * Captures method, URL, status code, response time, client IP, and user agent.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Hook into response finish to capture status and timing
  res.on("finish", () => {
    const duration = Date.now() - start;
    const meta = {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: `${duration}ms`,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get("user-agent"),
    };

    // Use http level for access.log
    if (res.statusCode >= 500) {
      logger.error("Request completed with server error", meta);
    } else if (res.statusCode >= 400) {
      logger.warn("Request completed with client error", meta);
    } else {
      logger.http("Request completed", meta);
    }
  });

  next();
};

module.exports = requestLogger;
