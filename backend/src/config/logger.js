const winston = require("winston");
const { createLogger, format, transports } = winston;
const path = require("path");
const fs = require("fs");

const config = require("./index");

// ── Log directory ──────────────────────────────────────────────────
const LOG_DIR = path.join(__dirname, "..", "..", "logs");
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ── Date string for filenames ─────────────────────────────────────
const dateStr = () => new Date().toISOString().slice(0, 10);

// ── Shared format components ──────────────────────────────────────
const timestampFormat = format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" });

const jsonFormat = format.combine(timestampFormat, format.json());

const consoleFormat = format.combine(
  timestampFormat,
  format.colorize(),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// ── Format filter: only pass messages matching a _logType meta ────
const onlyLogType = (type) =>
  format((info) => (info._logType === type ? info : false))();

// ── Format filter: strip _logType before writing ──────────────────
const stripLogType = format((info) => {
  const cleaned = { ...info };
  delete cleaned._logType;
  return cleaned;
});

// ── Format filter: only pass error level ──────────────────────────
const onlyError = format((info) => (info.level === "error" ? info : false))();

// ── File transport factory ────────────────────────────────────────
const fileDefaults = {
  maxsize: 10 * 1024 * 1024,
  maxFiles: 30,
  tailable: true,
};

// ── Logger instance ───────────────────────────────────────────────
const logger = createLogger({
  levels: winston.config.npm.levels,
  level: config.nodeEnv === "production" ? "info" : "debug",
  transports: [
    // Console — always enabled
    new transports.Console({ format: consoleFormat }),

    // Combined — all levels, clean format
    new transports.File({
      filename: path.join(LOG_DIR, `combined-${dateStr()}.log`),
      format: format.combine(stripLogType(), jsonFormat),
      ...fileDefaults,
    }),

    // Error — error only
    new transports.File({
      filename: path.join(LOG_DIR, `error-${dateStr()}.log`),
      format: format.combine(onlyError, stripLogType(), jsonFormat),
      ...fileDefaults,
    }),

    // Access — http level with _logType: "access"
    new transports.File({
      filename: path.join(LOG_DIR, `access-${dateStr()}.log`),
      format: format.combine(onlyLogType("access"), stripLogType(), jsonFormat),
      ...fileDefaults,
    }),

    // Audit — info level with _logType: "audit"
    new transports.File({
      filename: path.join(LOG_DIR, `audit-${dateStr()}.log`),
      format: format.combine(onlyLogType("audit"), stripLogType(), jsonFormat),
      ...fileDefaults,
    }),

    // Security — warn level with _logType: "security"
    new transports.File({
      filename: path.join(LOG_DIR, `security-${dateStr()}.log`),
      format: format.combine(onlyLogType("security"), stripLogType(), jsonFormat),
      ...fileDefaults,
    }),
  ],
});

module.exports = logger;
