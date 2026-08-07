const Honeypot = require("../models/Honeypot");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { buildQuery, paginateMeta } = require("../utils/queryBuilder");
const logger = require("../utils/logger");

const SEARCH_FIELDS = ["name", "ipAddress", "hostname", "location", "tags"];
const FILTER_FIELDS = ["engine", "environment", "status"];

// ── GET /api/v1/honeypots ────────────────────────────────────────────
const getHoneypots = async (req, res) => {
  try {
    const { filter, pagination, sort } = buildQuery(
      req.query,
      "Honeypot",
      SEARCH_FIELDS,
      FILTER_FIELDS
    );

    const [docs, total] = await Promise.all([
      Honeypot.find(filter).sort(sort).skip(pagination.skip).limit(pagination.limit),
      Honeypot.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Honeypots retrieved successfully", {
      honeypots: docs,
      pagination: paginateMeta(total, pagination),
    });
  } catch (err) {
    logger.error("Failed to retrieve honeypots", { error: err.message });
    return errorResponse(res, 500, "Failed to retrieve honeypots", err.message);
  }
};

// ── GET /api/v1/honeypots/:id ────────────────────────────────────────
const getHoneypotById = async (req, res) => {
  try {
    const doc = await Honeypot.findById(req.params.id);

    if (!doc) {
      return errorResponse(res, 404, "Honeypot not found");
    }

    return successResponse(res, 200, "Honeypot retrieved successfully", doc);
  } catch (err) {
    logger.error("Failed to retrieve honeypot", { error: err.message, honeypotId: req.params.id });
    return errorResponse(res, 500, "Failed to retrieve honeypot", err.message);
  }
};

// ── POST /api/v1/honeypots ───────────────────────────────────────────
const createHoneypot = async (req, res) => {
  try {
    const doc = await Honeypot.create(req.body);

    logger.audit("Honeypot created", {
      honeypotId: doc._id,
      name: doc.name,
      engine: doc.engine,
      ipAddress: doc.ipAddress,
      performedBy: req.user?.email || "system",
    });

    return successResponse(res, 201, "Honeypot created successfully", doc);
  } catch (err) {
    if (err.code === 11000) {
      return errorResponse(res, 409, "A honeypot with this name already exists");
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return errorResponse(res, 400, "Validation failed", messages);
    }
    logger.error("Failed to create honeypot", { error: err.message });
    return errorResponse(res, 500, "Failed to create honeypot", err.message);
  }
};

// ── PUT /api/v1/honeypots/:id ────────────────────────────────────────
const updateHoneypot = async (req, res) => {
  try {
    const doc = await Honeypot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return errorResponse(res, 404, "Honeypot not found");
    }

    logger.audit("Honeypot updated", {
      honeypotId: doc._id,
      name: doc.name,
      engine: doc.engine,
      updatedFields: Object.keys(req.body),
      performedBy: req.user?.email || "system",
    });

    return successResponse(res, 200, "Honeypot updated successfully", doc);
  } catch (err) {
    if (err.code === 11000) {
      return errorResponse(res, 409, "Duplicate honeypot name conflict");
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return errorResponse(res, 400, "Validation failed", messages);
    }
    logger.error("Failed to update honeypot", { error: err.message, honeypotId: req.params.id });
    return errorResponse(res, 500, "Failed to update honeypot", err.message);
  }
};

// ── DELETE /api/v1/honeypots/:id ─────────────────────────────────────
const deleteHoneypot = async (req, res) => {
  try {
    const doc = await Honeypot.findByIdAndDelete(req.params.id);

    if (!doc) {
      return errorResponse(res, 404, "Honeypot not found");
    }

    logger.audit("Honeypot deleted", {
      honeypotId: doc._id,
      name: doc.name,
      engine: doc.engine,
      performedBy: req.user?.email || "system",
    });

    return successResponse(res, 200, "Honeypot deleted successfully", { id: doc._id });
  } catch (err) {
    logger.error("Failed to delete honeypot", { error: err.message, honeypotId: req.params.id });
    return errorResponse(res, 500, "Failed to delete honeypot", err.message);
  }
};

module.exports = {
  getHoneypots,
  getHoneypotById,
  createHoneypot,
  updateHoneypot,
  deleteHoneypot,
};
