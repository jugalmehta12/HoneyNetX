const mongoose = require("mongoose");

const { Schema } = mongoose;

// ------------------------------------------------------------------
// User schema — platform user model designed to support future
// authentication (local, OAuth, SAML) without implementing auth
// logic in this sprint. Includes fields for RBAC, MFA, and audit.
// ------------------------------------------------------------------

const userSchema = new Schema(
  {
    // ---- Identity --------------------------------------------------------

    /** Full display name */
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    /** Unique email address — used as login identifier */
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    /** Hashed password — nullable for OAuth-only users */
    password: {
      type: String,
      select: false,
      minlength: [6, "Password must be at least 6 characters"],
    },

    // ---- Authorisation ---------------------------------------------------

    /** Platform role for RBAC */
    role: {
      type: String,
      enum: {
        values: ["admin", "analyst", "viewer", "readonly"],
        message: "{VALUE} is not a valid role",
      },
      default: "viewer",
      index: true,
      lowercase: true,
    },

    /** Granular permissions beyond role (e.g. ["reports:export", "users:manage"]) */
    permissions: {
      type: [String],
      default: [],
    },

    // ---- Authentication state (future) -----------------------------------

    /** Whether the user account is active */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    /** Whether email has been verified */
    isVerified: {
      type: Boolean,
      default: false,
    },

    /** Whether MFA is enabled for this user */
    mfaEnabled: {
      type: Boolean,
      default: false,
    },

    /** TOTP secret for MFA (encrypted at rest in production) */
    mfaSecret: {
      type: String,
      select: false,
    },

    /** OAuth provider if authenticated externally */
    oauthProvider: {
      type: String,
      enum: {
        values: ["local", "google", "microsoft", "github", "saml"],
        message: "{VALUE} is not a supported auth provider",
      },
      default: "local",
      lowercase: true,
    },

    /** External provider user ID */
    oauthId: {
      type: String,
      trim: true,
      sparse: true,
    },

    // ---- Session tracking ------------------------------------------------

    /** Timestamp of last successful login */
    lastLoginAt: {
      type: Date,
    },

    /** IP address of last login */
    lastLoginIp: {
      type: String,
      trim: true,
    },

    /** Number of consecutive failed login attempts (lockout counter) */
    failedLoginAttempts: {
      type: Number,
      default: 0,
      min: [0, "Failed attempts cannot be negative"],
    },

    /** Account lockout expiry */
    lockedUntil: {
      type: Date,
    },

    // ---- Password reset (future) -----------------------------------------

    /** Token for password reset flow */
    passwordResetToken: {
      type: String,
      select: false,
    },

    /** Expiry of password reset token */
    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // ---- Profile / preferences -------------------------------------------

    /** User avatar URL */
    avatar: {
      type: String,
      trim: true,
    },

    /** Preferred timezone for report scheduling */
    timezone: {
      type: String,
      trim: true,
      default: "UTC",
    },

    /** Notification preferences */
    notifications: {
      email: { type: Boolean, default: true },
      browser: { type: Boolean, default: true },
      slack: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    collection: "users",
    versionKey: false,
  }
);

// ---- Indexes --------------------------------------------------------------

/** Lookup by role for admin user management */
userSchema.index({ role: 1 });

/** Compound index for active users by role */
userSchema.index({ isActive: 1, role: 1 });

/** OAuth lookup */
userSchema.index({ oauthProvider: 1, oauthId: 1 }, { sparse: true });

module.exports = mongoose.model("User", userSchema);
