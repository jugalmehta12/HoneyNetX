const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const config = require("../config");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const logger = require("../utils/logger");

const SALT_ROUNDS = 12;

// ── Helper: generate tokens ──────────────────────────────────────────

const generateAccessToken = (user) =>
  jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    config.jwtAccessSecret,
    { expiresIn: config.jwtAccessExpiresIn }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn }
  );

// ── POST /api/v1/auth/register ───────────────────────────────────────

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      logger.security("Registration attempt with duplicate email", {
        email,
        ip: req.ip,
      });
      return errorResponse(res, 409, "A user with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "viewer",
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    logger.security("User registered successfully", {
      userId: user._id,
      email: user.email,
      role: user.role,
      ip: req.ip,
    });

    return successResponse(res, 201, "Registration successful", {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    if (err.code === 11000) {
      logger.security("Registration attempt with duplicate email (DB constraint)", {
        email: req.body.email,
        ip: req.ip,
      });
      return errorResponse(res, 409, "A user with this email already exists");
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return errorResponse(res, 400, "Validation failed", messages);
    }
    logger.error("Registration failed", { error: err.message, ip: req.ip });
    return errorResponse(res, 500, "Registration failed", err.message);
  }
};

// ── POST /api/v1/auth/login ──────────────────────────────────────────

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, "Email and password are required");
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      logger.security("Failed login — user not found", { email, ip: req.ip });
      return errorResponse(res, 401, "Invalid email or password");
    }

    if (!user.isActive) {
      logger.security("Failed login — inactive account", {
        email,
        userId: user._id,
        ip: req.ip,
      });
      return errorResponse(res, 403, "Your account has been deactivated. Contact an administrator.");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      logger.security("Failed login — incorrect password", {
        email,
        userId: user._id,
        ip: req.ip,
      });
      return errorResponse(res, 401, "Invalid email or password");
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update login metadata
    user.lastLoginAt = new Date();
    user.lastLoginIp = req.ip;
    user.failedLoginAttempts = 0;
    await user.save({ validateBeforeSave: false });

    logger.security("User logged in successfully", {
      userId: user._id,
      email: user.email,
      role: user.role,
      ip: req.ip,
    });

    return successResponse(res, 200, "Login successful", {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    logger.error("Login failed", { error: err.message, ip: req.ip });
    return errorResponse(res, 500, "Login failed", err.message);
  }
};

// ── POST /api/v1/auth/logout ─────────────────────────────────────────

const logout = async (req, res) => {
  logger.security("User logged out", {
    userId: req.user?._id,
    email: req.user?.email,
    ip: req.ip,
  });
  return successResponse(res, 200, "Logged out successfully. Discard tokens on the client.");
};

// ── POST /api/v1/auth/refresh ────────────────────────────────────────

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 400, "Refresh token is required");
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        logger.security("Refresh token expired", { ip: req.ip });
        return errorResponse(res, 401, "Refresh token has expired. Please log in again.");
      }
      logger.security("Invalid refresh token used", { ip: req.ip });
      return errorResponse(res, 401, "Invalid refresh token");
    }

    const user = await User.findById(decoded.userId).select("name email role isActive");
    if (!user) {
      logger.security("Refresh token for deleted user", {
        userId: decoded.userId,
        ip: req.ip,
      });
      return errorResponse(res, 401, "User belonging to this token no longer exists");
    }

    if (!user.isActive) {
      logger.security("Refresh token for inactive user", {
        userId: user._id,
        email: user.email,
        ip: req.ip,
      });
      return errorResponse(res, 403, "Your account has been deactivated. Contact an administrator.");
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    logger.security("Token refreshed successfully", {
      userId: user._id,
      email: user.email,
      ip: req.ip,
    });

    return successResponse(res, 200, "Token refreshed successfully", {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    logger.error("Token refresh failed", { error: err.message, ip: req.ip });
    return errorResponse(res, 500, "Token refresh failed", err.message);
  }
};

// ── GET /api/v1/auth/me ──────────────────────────────────────────────

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-__v");

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    return successResponse(res, 200, "User profile retrieved successfully", { user });
  } catch (err) {
    logger.error("Failed to retrieve user profile", { error: err.message, userId: req.user._id });
    return errorResponse(res, 500, "Failed to retrieve user profile", err.message);
  }
};

module.exports = {
  register,
  login,
  logout,
  refresh,
  getMe,
};
