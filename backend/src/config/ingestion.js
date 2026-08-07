/**
 * Log ingestion framework configuration.
 * All ingestion-related settings are centralised here.
 */

const ingestionConfig = {
  /** Master switch — disable to stop all ingestion */
  enabled: process.env.INGESTION_ENABLED === "true",

  /** Absolute or relative path to the log file to monitor */
  logPath: process.env.INGESTION_LOG_PATH || "./logs/input.log",

  /** How often to poll for new lines (ms) */
  pollInterval: parseInt(process.env.INGESTION_POLL_INTERVAL, 10) || 1000,

  /** Input format: "jsonl" (JSON Lines) or "json" (plain JSON array) */
  format: process.env.INGESTION_FORMAT || "jsonl",

  /** Max file size before rotation is detected (bytes) */
  maxFileSize: parseInt(process.env.INGESTION_MAX_FILE_SIZE, 10) || 10 * 1024 * 1024,

  /** Character encoding when reading the log file */
  encoding: process.env.INGESTION_ENCODING || "utf8",
};

module.exports = ingestionConfig;
