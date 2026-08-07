const mongoose = require("mongoose");

const { Schema } = mongoose;

// ------------------------------------------------------------------
// Honeypot schema — represents a single honeypot instance deployed
// in the network. Supports multiple engine types and tracks
// operational status for the SOC dashboard.
// ------------------------------------------------------------------

const honeypotSchema = new Schema(
  {
    /** Human-readable name for this honeypot (e.g. "Cowrie-DMZ-01") */
    name: {
      type: String,
      required: [true, "Honeypot name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    /** Honeypot engine software */
    engine: {
      type: String,
      required: [true, "Honeypot engine is required"],
      enum: {
        values: ["cowrie", "dionaea", "honeypy", "honeyd", "custom"],
        message: "{VALUE} is not a supported honeypot engine",
      },
      index: true,
      lowercase: true,
      trim: true,
    },

    /** Deployment environment */
    environment: {
      type: String,
      required: [true, "Environment is required"],
      enum: {
        values: ["production", "staging", "development", "lab"],
        message: "{VALUE} is not a valid environment",
      },
      default: "production",
      index: true,
      lowercase: true,
    },

    // ---- Network details -------------------------------------------------

    /** IP address assigned to this honeypot */
    ipAddress: {
      type: String,
      required: [true, "IP address is required"],
      trim: true,
      match: [
        /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^[0-9a-fA-F:]+$/,
        "Invalid IP address format",
      ],
    },

    /** Network segment / VLAN this honeypot sits in */
    networkSegment: {
      type: String,
      trim: true,
      default: "default",
    },

    /** Hostname of the underlying VM or container */
    hostname: {
      type: String,
      trim: true,
    },

    /** Ports being monitored / exposed by this honeypot */
    ports: {
      type: [
        {
          port: {
            type: Number,
            required: true,
            min: [0, "Port must be >= 0"],
            max: [65535, "Port must be <= 65535"],
          },
          protocol: {
            type: String,
            enum: ["tcp", "udp"],
            default: "tcp",
            lowercase: true,
          },
          service: {
            type: String,
            trim: true,
          },
        },
      ],
      default: [],
    },

    // ---- Operational status ----------------------------------------------

    /** Current operational status */
    status: {
      type: String,
      enum: {
        values: ["online", "offline", "degraded", "maintenance"],
        message: "{VALUE} is not a valid status",
      },
      default: "online",
      index: true,
      lowercase: true,
    },

    /** Timestamp of last heartbeat received from this honeypot */
    lastHeartbeat: {
      type: Date,
      index: true,
    },

    /** Software version running on this honeypot */
    version: {
      type: String,
      trim: true,
    },

    // ---- Geographical / physical -----------------------------------------

    /** Physical location label (e.g. "US-East-DC1") */
    location: {
      type: String,
      trim: true,
    },

    /** Latitude for map visualisation */
    latitude: {
      type: Number,
      min: [-90, "Latitude must be >= -90"],
      max: [90, "Latitude must be <= 90"],
    },

    /** Longitude for map visualisation */
    longitude: {
      type: Number,
      min: [-180, "Longitude must be >= -180"],
      max: [180, "Longitude must be <= 180"],
    },

    // ---- Configuration / metadata ----------------------------------------

    /** Engine-specific configuration stored as key-value pairs */
    config: {
      type: Schema.Types.Mixed,
      default: {},
    },

    /** Free-form tags for filtering and grouping */
    tags: {
      type: [String],
      default: [],
      index: true,
    },

    /** Analyst notes about this honeypot */
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },

    /** Total attacks captured (denormalised counter for dashboard speed) */
    totalAttacks: {
      type: Number,
      default: 0,
      min: [0, "Total attacks cannot be negative"],
    },
  },
  {
    timestamps: true,
    collection: "honeypots",
    versionKey: false,
  }
);

// ---- Indexes --------------------------------------------------------------

/** Lookup by engine + status for dashboard overview */
honeypotSchema.index({ engine: 1, status: 1 });

/** Lookup by environment + status */
honeypotSchema.index({ environment: 1, status: 1 });

/** Geospatial queries for map view */
honeypotSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model("Honeypot", honeypotSchema);
