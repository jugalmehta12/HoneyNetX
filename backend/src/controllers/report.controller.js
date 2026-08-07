const Report = require("../models/Report");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { buildQuery, paginateMeta } = require("../utils/queryBuilder");
const logger = require("../utils/logger");

const SEARCH_FIELDS = ["title", "recipients", "filters"];
const FILTER_FIELDS = ["type", "format", "status", "requestedBy"];

// ── GET /api/v1/reports ──────────────────────────────────────────────
const getReports = async (req, res) => {
  try {
    const { filter, pagination, sort } = buildQuery(
      req.query,
      "Report",
      SEARCH_FIELDS,
      FILTER_FIELDS
    );

    const [docs, total] = await Promise.all([
      Report.find(filter).sort(sort).skip(pagination.skip).limit(pagination.limit),
      Report.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Reports retrieved successfully", {
      reports: docs,
      pagination: paginateMeta(total, pagination),
    });
  } catch (err) {
    logger.error("Failed to retrieve reports", { error: err.message });
    return errorResponse(res, 500, "Failed to retrieve reports", err.message);
  }
};

// ── GET /api/v1/reports/:id ──────────────────────────────────────────
const getReportById = async (req, res) => {
  try {
    const doc = await Report.findById(req.params.id);

    if (!doc) {
      return errorResponse(res, 404, "Report not found");
    }

    return successResponse(res, 200, "Report retrieved successfully", doc);
  } catch (err) {
    logger.error("Failed to retrieve report", { error: err.message, reportId: req.params.id });
    return errorResponse(res, 500, "Failed to retrieve report", err.message);
  }
};

// ── POST /api/v1/reports ─────────────────────────────────────────────
const createReport = async (req, res) => {
  try {
    const doc = await Report.create(req.body);

    logger.audit("Report generated", {
      reportId: doc._id,
      title: doc.title,
      type: doc.type,
      format: doc.format,
      requestedBy: req.user?.email || "system",
    });

    return successResponse(res, 201, "Report created successfully", doc);
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return errorResponse(res, 400, "Validation failed", messages);
    }
    logger.error("Failed to create report", { error: err.message });
    return errorResponse(res, 500, "Failed to create report", err.message);
  }
};

// ── DELETE /api/v1/reports/:id ───────────────────────────────────────
const deleteReport = async (req, res) => {
  try {
    const doc = await Report.findByIdAndDelete(req.params.id);

    if (!doc) {
      return errorResponse(res, 404, "Report not found");
    }

    logger.audit("Report deleted", {
      reportId: doc._id,
      title: doc.title,
      type: doc.type,
      performedBy: req.user?.email || "system",
    });

    return successResponse(res, 200, "Report deleted successfully", { id: doc._id });
  } catch (err) {
    logger.error("Failed to delete report", { error: err.message, reportId: req.params.id });
    return errorResponse(res, 500, "Failed to delete report", err.message);
  }
};

module.exports = {
  getReports,
  getReportById,
  createReport,
  deleteReport,
};
