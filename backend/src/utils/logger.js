/**
 * Centralized logging utility for HoneyNetX.
 * Controllers must NEVER write directly to Winston — always use this module.
 *
 * Log routing:
 *   logger.error()  → error.log + combined.log
 *   logger.warn()   → combined.log
 *   logger.info()   → combined.log
 *   logger.debug()  → combined.log
 *   logger.http()   → access.log + combined.log   (request logging)
 *   logger.audit()  → audit.log + combined.log    (CRUD admin actions)
 *   logger.security() → security.log + combined.log (auth events)
 */

const winston = require("../config/logger");

/**
 * General informational log.
 * @param {string} message
 * @param {Object} [meta]
 */
const info = (message, meta = {}) => {
  winston.log("info", message, meta);
};

/**
 * Warning log.
 * @param {string} message
 * @param {Object} [meta]
 */
const warn = (message, meta = {}) => {
  winston.log("warn", message, meta);
};

/**
 * Error log — writes to error.log and combined.log.
 * @param {string} message
 * @param {Object} [meta]
 */
const error = (message, meta = {}) => {
  winston.log("error", message, meta);
};

/**
 * Debug log — development only.
 * @param {string} message
 * @param {Object} [meta]
 */
const debug = (message, meta = {}) => {
  winston.log("debug", message, meta);
};

/**
 * HTTP access log — writes to access.log + combined.log.
 * @param {string} message
 * @param {Object} [meta]
 */
const http = (message, meta = {}) => {
  winston.log("http", message, { _logType: "access", ...meta });
};

/**
 * Audit log — CRUD administrative actions. Writes to audit.log + combined.log.
 * @param {string} message
 * @param {Object} [meta]
 */
const audit = (message, meta = {}) => {
  winston.log("info", message, { _logType: "audit", ...meta });
};

/**
 * Security log — authentication events. Writes to security.log + combined.log.
 * @param {string} message
 * @param {Object} [meta]
 */
const security = (message, meta = {}) => {
  winston.log("warn", message, { _logType: "security", ...meta });
};

/**
 * Flush all file transports and close handles.
 * Must be called during graceful shutdown to ensure logs are written.
 */
const close = () => {
  winston.close();
};

module.exports = { info, warn, error, debug, http, audit, security, close };
