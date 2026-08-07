const AttackLog = require("../models/AttackLog");
const logger = require("../utils/logger");
const parser = require("../services/ingestion/parser");
const { mapEvent } = require("../services/ingestion/mapper");

/**
 * Event processor — receives raw log lines, parses them,
 * validates required fields, maps to AttackLog structure,
 * and stores in MongoDB. Records all outcomes.
 */
const processLine = async (line) => {
  // ── Parse ─────────────────────────────────────────────────────
  const result = parser.parseLine(line);

  if (!result.success) {
    logger.warn("Ingestion: parse failure", { error: result.error, raw: line.substring(0, 200) });
    return { stored: false, reason: "parse_error", error: result.error };
  }

  // ── Validate minimum required fields ──────────────────────────
  const event = result.data;

  if (!event.srcIp) {
    logger.warn("Ingestion: missing srcIp", { eventId: event.eventId });
    return { stored: false, reason: "validation_error", error: "Missing required field: srcIp" };
  }

  if (!event.dstIp) {
    logger.warn("Ingestion: missing dstIp", { eventId: event.eventId });
    return { stored: false, reason: "validation_error", error: "Missing required field: dstIp" };
  }

  if (!event.eventId) {
    logger.warn("Ingestion: missing eventId", { srcIp: event.srcIp });
    return { stored: false, reason: "validation_error", error: "Missing required field: eventId" };
  }

  // ── Map to AttackLog structure ────────────────────────────────
  const mapped = mapEvent(event);

  // ── Build the database document ───────────────────────────────
  const doc = {
    eventId: event.eventId,
    source: mapped.source,
    srcIp: mapped.destination.srcIp,
    dstIp: mapped.destination.dstIp,
    srcPort: mapped.destination.srcPort,
    dstPort: mapped.destination.dstPort,
    protocol: mapped.protocol,
    sessionId: mapped.sessionId,
    eventType: mapped.eventType,
    severity: mapped.severity,
    username: mapped.username,
    password: mapped.password,
    command: mapped.command,
    metadata: mapped.metadata,
    rawLog: mapped.rawLog,
    timestamp: mapped.timestamp,
    processed: true,
  };

  // ── Store in MongoDB ──────────────────────────────────────────
  try {
    await AttackLog.create(doc);
    logger.debug("Ingestion: event stored", { eventId: doc.eventId, eventType: doc.eventType });
    return { stored: true, eventId: doc.eventId };
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate eventId — skip silently
      logger.debug("Ingestion: duplicate event skipped", { eventId: doc.eventId });
      return { stored: false, reason: "duplicate", eventId: doc.eventId };
    }

    logger.error("Ingestion: database error", {
      error: err.message,
      eventId: doc.eventId,
      srcIp: doc.srcIp,
    });
    return { stored: false, reason: "database_error", error: err.message };
  }
};

/**
 * Process a batch of raw lines.
 * @param {string[]} lines
 * @returns {Promise<{ total: number, stored: number, failed: number, duplicates: number, stats: Object }>}
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

module.exports = { processLine, processBatch };
