const fs = require("fs");
const path = require("path");
const logger = require("../../utils/logger");
const ingestionConfig = require("../../config/ingestion");

/**
 * Log file watcher — polls a file for new lines, detects rotation,
 * and handles missing files gracefully. Never crashes the backend.
 *
 * Emits raw line strings via the provided callback.
 */
class LogWatcher {
  /**
   * @param {Object}   options
   * @param {string}   options.filePath      - Path to the log file
   * @param {number}   options.pollInterval  - Poll interval in ms
   * @param {string}   options.encoding      - Character encoding
   * @param {Function} options.onLine        - Callback: (line: string) => void
   * @param {Function} [options.onError]     - Callback: (err: Error) => void
   */
  constructor({ filePath, pollInterval, encoding, onLine, onError }) {
    this.filePath = path.resolve(filePath);
    this.pollInterval = pollInterval;
    this.encoding = encoding;
    this.onLine = onLine;
    this.onError = onError || (() => {});

    this._timer = null;
    this._size = 0;
    this._running = false;
  }

  /**
   * Start watching for new lines.
   * If the file doesn't exist yet, logs a warning and keeps polling.
   */
  startWatching() {
    if (this._running) {
      logger.warn("LogWatcher already running", { filePath: this.filePath });
      return;
    }

    this._running = true;
    logger.info("LogWatcher starting", {
      filePath: this.filePath,
      pollInterval: this.pollInterval,
    });

    // Check if file exists on start
    this._checkFileExists();

    this._timer = setInterval(() => this._poll(), this.pollInterval);

    // Don't hold the process open if the timer is the only thing running
    if (this._timer.unref) {
      this._timer.unref();
    }
  }

  /**
   * Stop watching and clean up.
   */
  stopWatching() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
    this._running = false;
    logger.info("LogWatcher stopped", { filePath: this.filePath });
  }

  /** @returns {boolean} Whether the watcher is actively polling */
  get isRunning() {
    return this._running;
  }

  // ── Internal ────────────────────────────────────────────────────

  _checkFileExists() {
    try {
      const stats = fs.statSync(this.filePath, { throwIfNoEntry: false });
      if (stats) {
        this._size = stats.size;
        logger.info("LogWatcher found existing log file", {
          filePath: this.filePath,
          size: this._size,
        });
      } else {
        logger.warn("LogWatcher — log file not found, waiting for creation", {
          filePath: this.filePath,
        });
      }
    } catch {
      logger.warn("LogWatcher — log file not found, waiting for creation", {
        filePath: this.filePath,
      });
    }
  }

  _poll() {
    try {
      const stats = fs.statSync(this.filePath, { throwIfNoEntry: false });

      if (!stats) {
        // File doesn't exist yet — nothing to do
        return;
      }

      // ── Rotation detection ──────────────────────────────────────
      if (stats.size < this._size) {
        logger.info("LogWatcher — file rotation detected, resetting offset", {
          filePath: this.filePath,
          oldSize: this._size,
          newSize: stats.size,
        });
        this._size = 0;
      }

      // ── No new data ────────────────────────────────────────────
      if (stats.size === this._size) {
        return;
      }

      // ── Read new bytes ─────────────────────────────────────────
      const fd = fs.openSync(this.filePath, "r");
      const buffer = Buffer.alloc(stats.size - this._size);
      fs.readSync(fd, buffer, 0, buffer.length, this._size);
      fs.closeSync(fd);

      this._size = stats.size;

      const chunk = buffer.toString(this.encoding);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.trim().length > 0) {
          this.onLine(line);
        }
      }
    } catch (err) {
      // Log but never crash
      this.onError(err);
    }
  }
}

/**
 * Factory: create and return a configured LogWatcher instance.
 * @param {Function} onLine - Callback for each new line
 * @returns {LogWatcher}
 */
const createLogWatcher = (onLine) => {
  return new LogWatcher({
    filePath: ingestionConfig.logPath,
    pollInterval: ingestionConfig.pollInterval,
    encoding: ingestionConfig.encoding,
    onLine,
    onError: (err) => {
      logger.error("LogWatcher error", { error: err.message, filePath: ingestionConfig.logPath });
    },
  });
};

module.exports = { LogWatcher, createLogWatcher };
