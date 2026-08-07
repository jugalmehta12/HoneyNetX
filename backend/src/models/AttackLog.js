const mongoose = require("mongoose");

const { Schema } = mongoose;

// ------------------------------------------------------------------
// AttackLog schema — production-grade ingestion model for honeypot
// telemetry. Designed around Cowrie JSON output but extensible to
// Dionaea, HoneyPy, and HoneyD log formats via the `source` field.
// ------------------------------------------------------------------

const attackLogSchema = new Schema(
  {
    // ---- Core identifiers ------------------------------------------------

    /** Unique event identifier (maps to Cowrie `eventid` or equivalent) */
    eventId: {
      type: String,
      required: [true, "Event ID is required"],
      unique: true,
      index: true,
      trim: true,
    },

    /** Which honeypot engine produced this log entry */
    source: {
      type: String,
      required: [true, "Source honeypot engine is required"],
      enum: {
        values: ["cowrie", "dionaea", "honeypy", "honeyd", "custom"],
        message: "{VALUE} is not a supported honeypot source",
      },
      index: true,
      lowercase: true,
      trim: true,
    },

    // ---- Attacker details -------------------------------------------------

    /** Source IP of the attacker */
    srcIp: {
      type: String,
      required: [true, "Source IP is required"],
      index: true,
      trim: true,
      // Basic IPv4/IPv6 validation
      match: [
        /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^[0-9a-fA-F:]+$/,
        "Invalid IP address format",
      ],
    },

    /** Destination IP of the honeypot */
    dstIp: {
      type: String,
      required: [true, "Destination IP is required"],
      trim: true,
      match: [
        /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^[0-9a-fA-F:]+$/,
        "Invalid IP address format",
      ],
    },

    /** Source port used by the attacker */
    srcPort: {
      type: Number,
      min: [0, "Port must be >= 0"],
      max: [65535, "Port must be <= 65535"],
    },

    /** Destination port targeted on the honeypot */
    dstPort: {
      type: Number,
      min: [0, "Port must be >= 0"],
      max: [65535, "Port must be <= 65535"],
      index: true,
    },

    /** Transport protocol */
    protocol: {
      type: String,
      enum: {
        values: ["tcp", "udp", "icmp", "other"],
        message: "{VALUE} is not a valid protocol",
      },
      default: "tcp",
      lowercase: true,
      trim: true,
    },

    // ---- Session / event metadata ----------------------------------------

    /** Cowrie session ID or equivalent correlation key */
    sessionId: {
      type: String,
      index: true,
      trim: true,
    },

    /** High-level event category for quick filtering */
    eventType: {
      type: String,
      required: [true, "Event type is required"],
      enum: {
        values: [
          "login_attempt",
          "login_success",
          "command",
          "file_upload",
          "file_download",
          "connection",
          "scan",
          "exploit",
          "sensor",
          "other",
        ],
        message: "{VALUE} is not a valid event type",
      },
      index: true,
      lowercase: true,
      trim: true,
    },

    /** Severity rating from the honeypot or enrichment pipeline */
    severity: {
      type: String,
      enum: {
        values: ["low", "medium", "high", "critical"],
        message: "{VALUE} is not a valid severity level",
      },
      default: "low",
      index: true,
      lowercase: true,
    },

    // ---- Payload / raw data ----------------------------------------------

    /** Username captured during auth attempts (Cowrie `username`) */
    username: {
      type: String,
      trim: true,
      sparse: true,
    },

    /** Password captured during auth attempts (Cowrie `password`) */
    password: {
      type: String,
      trim: true,
      select: false, // Never return by default — sensitive
    },

    /** Command executed if session produced a shell interaction */
    command: {
      type: String,
      trim: true,
    },

    /** Arbitrary key-value metadata from the honeypot JSON */
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    /** Full raw log entry preserved for forensic audit */
    rawLog: {
      type: Schema.Types.Mixed,
      select: false,
    },

    // ---- Geo / threat enrichment (future) -------------------------------

    /** Country resolved from srcIp via enrichment pipeline */
    country: {
      type: String,
      trim: true,
    },

    /** ASN resolved from srcIp */
    asn: {
      type: String,
      trim: true,
    },

    /** Threat intelligence score (0-100) from external feed */
    threatScore: {
      type: Number,
      min: [0, "Threat score must be >= 0"],
      max: [100, "Threat score must be <= 100"],
      default: 0,
    },

    /** Tags applied by enrichment or analyst (e.g. "brute-force", "c2") */
    tags: {
      type: [String],
      default: [],
      index: true,
    },

    // ---- Processing state ------------------------------------------------

    /** Whether this log has been processed by the analytics pipeline */
    processed: {
      type: Boolean,
      default: false,
      index: true,
    },

    /** Reference to the honeypot instance that captured this event */
    honeypotId: {
      type: Schema.Types.ObjectId,
      ref: "Honeypot",
      index: true,
    },

    /** Analyst notes appended during investigation */
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },
  },
  {
    timestamps: { createdAt: "timestamp", updatedAt: "updatedAt" },
    collection: "attack_logs",
    versionKey: false,
  }
);

// ---- Compound indexes for common SOC queries ------------------------------

/** Query by source IP + time range (most common dashboard query) */
attackLogSchema.index({ srcIp: 1, timestamp: -1 });

/** Query by event type + severity for alert triage */
attackLogSchema.index({ eventType: 1, severity: 1 });

/** Query by honeypot instance + time */
attackLogSchema.index({ honeypotId: 1, timestamp: -1 });

/** Query by dstPort + eventType for service-targeted analysis */
attackLogSchema.index({ dstPort: 1, eventType: 1 });

/** Full-text search on command and username fields */
attackLogSchema.index({ command: "text", username: "text" });

module.exports = mongoose.model("AttackLog", attackLogSchema);
