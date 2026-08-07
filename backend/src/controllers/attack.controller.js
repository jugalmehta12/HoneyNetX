const AttackLog = require("../models/AttackLog");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { buildQuery, paginateMeta } = require("../utils/queryBuilder");

const SEARCH_FIELDS = ["eventId", "srcIp", "dstIp", "username", "command", "sessionId", "tags"];
const FILTER_FIELDS = [
  "source",
  "eventType",
  "severity",
  "protocol",
  "processed",
  "honeypotId",
  "dstPort",
];

// ── GET /api/v1/attacks ──────────────────────────────────────────────
const getAttacks = async (req, res) => {
  try {
    const { filter, pagination, sort } = buildQuery(
      req.query,
      "AttackLog",
      SEARCH_FIELDS,
      FILTER_FIELDS
    );

    const [docs, total] = await Promise.all([
      AttackLog.find(filter).sort(sort).skip(pagination.skip).limit(pagination.limit),
      AttackLog.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Attacks retrieved successfully", {
      attacks: docs,
      pagination: paginateMeta(total, pagination),
    });
  } catch (err) {
    return errorResponse(res, 500, "Failed to retrieve attacks", err.message);
  }
};

// ── GET /api/v1/attacks/:id ──────────────────────────────────────────
const getAttackById = async (req, res) => {
  try {
    const doc = await AttackLog.findById(req.params.id);

    if (!doc) {
      return errorResponse(res, 404, "Attack log not found");
    }

    return successResponse(res, 200, "Attack retrieved successfully", doc);
  } catch (err) {
    return errorResponse(res, 500, "Failed to retrieve attack", err.message);
  }
};

// ── POST /api/v1/attacks ─────────────────────────────────────────────
const createAttack = async (req, res) => {
  try {
    const doc = await AttackLog.create(req.body);
    return successResponse(res, 201, "Attack log created successfully", doc);
  } catch (err) {
    if (err.code === 11000) {
      return errorResponse(res, 409, "An attack log with this event ID already exists");
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return errorResponse(res, 400, "Validation failed", messages);
    }
    return errorResponse(res, 500, "Failed to create attack log", err.message);
  }
};

// ── PUT /api/v1/attacks/:id ──────────────────────────────────────────
const updateAttack = async (req, res) => {
  try {
    const doc = await AttackLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return errorResponse(res, 404, "Attack log not found");
    }

    return successResponse(res, 200, "Attack log updated successfully", doc);
  } catch (err) {
    if (err.code === 11000) {
      return errorResponse(res, 409, "Duplicate event ID conflict");
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return errorResponse(res, 400, "Validation failed", messages);
    }
    return errorResponse(res, 500, "Failed to update attack log", err.message);
  }
};

// ── DELETE /api/v1/attacks/:id ───────────────────────────────────────
const deleteAttack = async (req, res) => {
  try {
    const doc = await AttackLog.findByIdAndDelete(req.params.id);

    if (!doc) {
      return errorResponse(res, 404, "Attack log not found");
    }

    return successResponse(res, 200, "Attack log deleted successfully", { id: doc._id });
  } catch (err) {
    return errorResponse(res, 500, "Failed to delete attack log", err.message);
  }
};

module.exports = {
  getAttacks,
  getAttackById,
  createAttack,
  updateAttack,
  deleteAttack,
};
