const mongoose = require("mongoose");
const AttackLog = require("../models/AttackLog");
const Honeypot = require("../models/Honeypot");
const ingestionConfig = require("../config/ingestion");
const logger = require("../utils/logger");
const parser = require("../services/ingestion/parser");
const { normalizeCowrieEvent } = require("../services/ingestion/cowrieAdapter");
const { mapEvent } = require("../services/ingestion/mapper");

const ACTIONABLE_ATTACK_TYPES = new Set([
  "login_attempt",
  "login_success",
  "command",
  "file_upload",
  "file_download",
  "scan",
  "exploit",
]);

const configuredHoneypotId = String(ingestionConfig.honeypotId || "").trim();
let hasWarnedAboutHoneypotLink = false;

/**
 * Resolve an optional configured honeypot reference. A bad/stale ID or
 * a source/engine mismatch must not prevent otherwise valid event ingestion.
 *
 * @param {string} source
 * @returns {Promise<import("mongoose").Types.ObjectId|undefined>}
 */
const resolveConfiguredHoneypotId = async (source) => {
  if (!configuredHoneypotId) return undefined;

  const warnOnce = (message, details = {}) => {
    if (hasWarnedAboutHoneypotLink) return;
    hasWarnedAboutHoneypotLink = true;
    logger.warn(message, details);
  };

  if (!mongoose.Types.ObjectId.isValid(configuredHoneypotId)) {
    warnOnce("Ingestion: INGESTION_HONEYPOT_ID is not a valid MongoDB ObjectId");
    return undefined;
  }

  try {
    const honeypot = await Honeypot.findOne({
      _id: configuredHoneypotId,
      engine: source,
    }).select("_id").lean();

    if (!honeypot) {
      warnOnce("Ingestion: configured honeypot was not found or its engine does not match", {
        source,
      });
      return undefined;
    }

    return honeypot._id;
  } catch (err) {
    warnOnce("Ingestion: could not resolve configured honeypot; storing event without a honeypot link", {
      error: err.message,
    });
    return undefined;
  }
};

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

  // ── Resolve the configured honeypot (when configured) ────────
  const honeypotId = await resolveConfiguredHoneypotId(mapped.source);

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
    honeypotId,
  };

  // ── Store in MongoDB ──────────────────────────────────────────
  try {
    await AttackLog.create(doc);

    // Count only newly stored, actionable attack telemetry. Connection and
    // sensor-lifecycle events remain linked but do not inflate the attack count.
    if (doc.honeypotId && ACTIONABLE_ATTACK_TYPES.has(doc.eventType)) {
      try {
        const counterUpdate = await Honeypot.updateOne(
          { _id: doc.honeypotId },
          { $inc: { totalAttacks: 1 } }
        );

        if (counterUpdate.matchedCount === 0) {
          logger.warn("Ingestion: linked honeypot disappeared before its attack counter update", {
            honeypotId: String(doc.honeypotId),
            eventId: doc.eventId,
          });
        }
      } catch (counterError) {
        // The attack log is already stored, so a counter failure is reported
        // separately rather than misclassifying the ingested event as failed.
        logger.error("Ingestion: honeypot attack counter update failed", {
          error: counterError.message,
          honeypotId: String(doc.honeypotId),
          eventId: doc.eventId,
        });
      }
    }

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