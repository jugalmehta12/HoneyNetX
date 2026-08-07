const User = require("../models/User");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { buildQuery, paginateMeta } = require("../utils/queryBuilder");
const logger = require("../utils/logger");

const SEARCH_FIELDS = ["name", "email"];
const FILTER_FIELDS = ["role", "isActive", "oauthProvider"];

// ── GET /api/v1/users ────────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const { filter, pagination, sort } = buildQuery(
      req.query,
      "User",
      SEARCH_FIELDS,
      FILTER_FIELDS
    );

    const [docs, total] = await Promise.all([
      User.find(filter).sort(sort).skip(pagination.skip).limit(pagination.limit),
      User.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Users retrieved successfully", {
      users: docs,
      pagination: paginateMeta(total, pagination),
    });
  } catch (err) {
    logger.error("Failed to retrieve users", { error: err.message });
    return errorResponse(res, 500, "Failed to retrieve users", err.message);
  }
};

// ── GET /api/v1/users/:id ────────────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const doc = await User.findById(req.params.id);

    if (!doc) {
      return errorResponse(res, 404, "User not found");
    }

    return successResponse(res, 200, "User retrieved successfully", doc);
  } catch (err) {
    logger.error("Failed to retrieve user", { error: err.message, userId: req.params.id });
    return errorResponse(res, 500, "Failed to retrieve user", err.message);
  }
};

// ── POST /api/v1/users ───────────────────────────────────────────────
const createUser = async (req, res) => {
  try {
    const doc = await User.create(req.body);

    logger.audit("User created", {
      userId: doc._id,
      email: doc.email,
      role: doc.role,
      performedBy: req.user?.email || "system",
    });

    return successResponse(res, 201, "User created successfully", doc);
  } catch (err) {
    if (err.code === 11000) {
      return errorResponse(res, 409, "A user with this email already exists");
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return errorResponse(res, 400, "Validation failed", messages);
    }
    logger.error("Failed to create user", { error: err.message });
    return errorResponse(res, 500, "Failed to create user", err.message);
  }
};

// ── PUT /api/v1/users/:id ────────────────────────────────────────────
const updateUser = async (req, res) => {
  try {
    const doc = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return errorResponse(res, 404, "User not found");
    }

    logger.audit("User updated", {
      userId: doc._id,
      email: doc.email,
      role: doc.role,
      updatedFields: Object.keys(req.body),
      performedBy: req.user?.email || "system",
    });

    return successResponse(res, 200, "User updated successfully", doc);
  } catch (err) {
    if (err.code === 11000) {
      return errorResponse(res, 409, "Duplicate email conflict");
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return errorResponse(res, 400, "Validation failed", messages);
    }
    logger.error("Failed to update user", { error: err.message, userId: req.params.id });
    return errorResponse(res, 500, "Failed to update user", err.message);
  }
};

// ── DELETE /api/v1/users/:id ─────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const doc = await User.findByIdAndDelete(req.params.id);

    if (!doc) {
      return errorResponse(res, 404, "User not found");
    }

    logger.audit("User deleted", {
      userId: doc._id,
      email: doc.email,
      role: doc.role,
      performedBy: req.user?.email || "system",
    });

    return successResponse(res, 200, "User deleted successfully", { id: doc._id });
  } catch (err) {
    logger.error("Failed to delete user", { error: err.message, userId: req.params.id });
    return errorResponse(res, 500, "Failed to delete user", err.message);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
