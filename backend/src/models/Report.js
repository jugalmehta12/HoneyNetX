const mongoose = require("mongoose");

const { Schema } = mongoose;

// ------------------------------------------------------------------
// Report schema — stores metadata about generated reports (PDF, CSV,
// or future formats). The actual file is stored externally (S3 / local
// filesystem); this model tracks lifecycle and delivery.
// ------------------------------------------------------------------

const reportSchema = new Schema(
  {
    /** Human-readable report title */
    title: {
      type: String,
      required: [true, "Report title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    /** Report type determines the data pipeline and template used */
    type: {
      type: String,
      required: [true, "Report type is required"],
      enum: {
        values: [
          "attack_summary",
          "threat_intelligence",
          "honeypot_status",
          "compliance",
          "incident",
          "custom",
        ],
        message: "{VALUE} is not a valid report type",
      },
      index: true,
      lowercase: true,
      trim: true,
    },

    /** Output format */
    format: {
      type: String,
      required: [true, "Report format is required"],
      enum: {
        values: ["pdf", "csv", "json", "html"],
        message: "{VALUE} is not a supported report format",
      },
      default: "pdf",
      lowercase: true,
    },

    // ---- Generation details ----------------------------------------------

    /** User who requested the report */
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    /** Current status of the report generation pipeline */
    status: {
      type: String,
      enum: {
        values: ["pending", "generating", "completed", "failed", "expired"],
        message: "{VALUE} is not a valid report status",
      },
      default: "pending",
      index: true,
      lowercase: true,
    },

    /** Percentage complete (0-100) for long-running generation jobs */
    progress: {
      type: Number,
      min: [0, "Progress must be >= 0"],
      max: [100, "Progress must be <= 100"],
      default: 0,
    },

    // ---- Data scope ------------------------------------------------------

    /** Date range the report covers */
    dateRange: {
      from: {
        type: Date,
        required: [true, "Date range start is required"],
      },
      to: {
        type: Date,
        required: [true, "Date range end is required"],
      },
    },

    /** Filters applied when generating the report */
    filters: {
      type: Schema.Types.Mixed,
      default: {},
    },

    /** Specific honeypots included (empty = all) */
    honeypotIds: {
      type: [Schema.Types.ObjectId],
      ref: "Honeypot",
      default: [],
    },

    // ---- Output ----------------------------------------------------------

    /** Path or URI to the generated file */
    fileUri: {
      type: String,
      trim: true,
    },

    /** File size in bytes after generation */
    fileSize: {
      type: Number,
      min: [0, "File size cannot be negative"],
    },

    /** MIME type of the generated file */
    mimeType: {
      type: String,
      trim: true,
    },

    /** SHA-256 hash of the generated file for integrity verification */
    fileHash: {
      type: String,
      trim: true,
      select: false,
    },

    // ---- Delivery --------------------------------------------------------

    /** Email addresses to deliver the report to */
    recipients: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => v.every((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
        message: "One or more recipient emails are invalid",
      },
    },

    /** Whether the report has been downloaded at least once */
    downloaded: {
      type: Boolean,
      default: false,
    },

    /** Number of times the report has been downloaded */
    downloadCount: {
      type: Number,
      default: 0,
      min: [0, "Download count cannot be negative"],
    },

    /** Expiry date — report files older than this may be purged */
    expiresAt: {
      type: Date,
      index: { expires: 0 }, // MongoDB TTL index — auto-delete after expiry
    },

    // ---- Error handling --------------------------------------------------

    /** Error message if generation failed */
    error: {
      type: String,
      trim: true,
      select: false,
    },

    /** Generation duration in milliseconds */
    generationDuration: {
      type: Number,
      min: [0, "Duration cannot be negative"],
    },
  },
  {
    timestamps: true,
    collection: "reports",
    versionKey: false,
  }
);

// ---- Indexes --------------------------------------------------------------

/** Lookup reports by type + status for the reports dashboard */
reportSchema.index({ type: 1, status: 1 });

/** Lookup reports by requesting user */
reportSchema.index({ requestedBy: 1, createdAt: -1 });

/** Date range queries for scheduling and archival */
reportSchema.index({ "dateRange.from": 1, "dateRange.to": 1 });

/** TTL index for automatic expiry (already defined via expiresAt field) */

module.exports = mongoose.model("Report", reportSchema);
