const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/User");
const { errorResponse } = require("../utils/apiResponse");

/**
 * Authentication middleware — verifies JWT access token and attaches
 * the decoded user to req.user. Must be placed before any controller
 * that requires a logged-in user.
 *
 * Token is read from:
 *   Authorization: Bearer <token>
 */
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, 401, "Authentication required. Please provide a valid token.");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtAccessSecret);

    const user = await User.findById(decoded.userId).select("name email role isActive");

    if (!user) {
      return errorResponse(res, 401, "User belonging to this token no longer exists.");
    }

    if (!user.isActive) {
      return errorResponse(res, 403, "Your account has been deactivated. Contact an administrator.");
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return errorResponse(res, 401, "Token has expired. Please log in again.");
    }
    if (err.name === "JsonWebTokenError") {
      return errorResponse(res, 401, "Invalid token. Please log in again.");
    }
    return errorResponse(res, 500, "Authentication error", err.message);
  }
};

module.exports = authenticateUser;
