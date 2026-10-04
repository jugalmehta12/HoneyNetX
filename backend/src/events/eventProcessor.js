const AttackLog = require("../models/AttackLog");
const logger = require("../utils/logger");
const parser = require("../services/ingestion/parser");
const { normalizeCowrieEvent } = require("../services/ingestion/cowrieAdapter");
const { mapEvent } = require("../services/ingestion/mapper");

/**
 * Event processor — receives raw log lines, parses them,
 * normalizes source-specific events, validates required fields,
 * maps them to AttackLog structure, and stores them in MongoDB.
 *
 * Pipeline:
 *   Raw line
 *      ↓
 *   JSON parser
 *      ↓
 *   Cowrie normalizer (when eventid starts with "cowrie.")
 *      ↓
 *   Validation
 *      ↓
 *   Generic event mapper
 *      ↓
 *   AttackLog MongoDB document
 */

/**
 * Process a single raw log line.
 *
 * @param {string} line - Raw JSONL log line
 * @returns {Promise<Object>}
 */
const processLine = async (line) => {
  // ── Parse ─────────────────────────────────────────────────────
  const result = parser.parseLine(line);

  if (!result.success) {
    // Do not log the raw line here because a malformed honeypot
    // event could contain sensitive credentials or payload data.
    logger.warn("Ingestion: parse failure", {
      error: result.error,
    });

    return {
      stored: false,
      reason: "parse_error",
      error: result.error,
    };
  }

  // ── Normalize source-specific event ───────────────────────────
  const rawEvent = result.data;

  /*
   * Cowrie emits native fields such as:
   *   eventid, src_ip, dst_ip, session, input, etc.
   *
   * HoneyNetX uses a source-agnostic internal format:
   *   eventId, srcIp, dstIp, sessionId, command, etc.
   *
   * Detect Cowrie by its event ID prefix and normalize it before
   * passing the event through the generic validation/mapping pipeline.
   */
  const event =
    typeof rawEvent.eventid === "string" &&
    rawEvent.eventid.startsWith("cowrie.")
      ? normalizeCowrieEvent(rawEvent)
      : rawEvent;

  // ── Validate minimum required fields ──────────────────────────
  if (!event.srcIp) {
    logger.warn("Ingestion: missing srcIp", {
      eventId: event.eventId,
    });

    return {
      stored: false,
      reason: "validation_error",
      error: "Missing required field: srcIp",
    };
  }

  if (!event.dstIp) {
    logger.warn("Ingestion: missing dstIp", {
      eventId: event.eventId,
    });

    return {
      stored: false,
      reason: "validation_error",
      error: "Missing required field: dstIp",
    };
  }

  if (!event.eventId) {
    logger.warn("Ingestion: missing eventId", {
      srcIp: event.srcIp,
    });

    return {
      stored: false,
      reason: "validation_error",
      error: "Missing required field: eventId",
    };
  }

  // ── Map to generic AttackLog structure ─────────────────────────
  const mapped = mapEvent(event);

  // ── Build MongoDB document ────────────────────────────────────
  const doc = {
    eventId: event.eventId,
    source: mapped.source,

    // Network information
    srcIp: mapped.destination.srcIp,
    dstIp: mapped.destination.dstIp,
    srcPort: mapped.destination.srcPort,
    dstPort: mapped.destination.dstPort,
    protocol: mapped.protocol,

    // Session / classification
    sessionId: mapped.sessionId,
    eventType: mapped.eventType,
    severity: mapped.severity,

    // Captured authentication / command data
    username: mapped.username,
    password: mapped.password,
    command: mapped.command,

    // Additional source metadata
    metadata: mapped.metadata,

    // Complete source event for forensic analysis
    rawLog: mapped.rawLog,

    // Event timestamp
    timestamp: mapped.timestamp,

    // Processing state
    processed: true,
  };

  // ── Store in MongoDB ──────────────────────────────────────────
  try {
    await AttackLog.create(doc);

    logger.debug("Ingestion: event stored", {
      eventId: doc.eventId,
      eventType: doc.eventType,
      source: doc.source,
    });

    return {
      stored: true,
      eventId: doc.eventId,
    };
  } catch (err) {
    // Duplicate event ID — safely ignore repeated log delivery.
    if (err.code === 11000) {
      logger.debug("Ingestion: duplicate event skipped", {
        eventId: doc.eventId,
      });

      return {
        stored: false,
        reason: "duplicate",
        eventId: doc.eventId,
      };
    }

    // Database/storage error.
    logger.error("Ingestion: database error", {
      error: err.message,
      eventId: doc.eventId,
      srcIp: doc.srcIp,
    });

    return {
      stored: false,
      reason: "database_error",
      error: err.message,
    };
  }
};

/**
 * Process a batch of raw log lines.
 *
 * @param {string[]} lines
 * @returns {Promise<{
 *   total: number,
 *   stored: number,
 *   failed: number,
 *   duplicates: number
 * }>}
 */
const processBatch = async (lines) => {
  const stats = {
    total: lines.length,
    stored: 0,
    failed: 0,
    duplicates: 0,
  };

  for (const line of lines) {
    const result = await processLine(line);

    if (result.stored) {
      stats.stored++;
    } else if (result.reason === "duplicate") {
      stats.duplicates++;
    } else {
      stats.failed++;
    }
  }

  if (stats.stored > 0 || stats.failed > 0) {
    logger.info("Ingestion: batch processed", stats);
  }

  return stats;
};

module.exports = {
  processLine,
  processBatch,
};