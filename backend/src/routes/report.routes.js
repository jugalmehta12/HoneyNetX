const { Router } = require("express");
const { body, param } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");
const authenticateUser = require("../middleware/authenticateUser");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
  getReports,
  getReportById,
  createReport,
  deleteReport,
} = require("../controllers/report.controller");

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// GET /api/v1/reports — admin, analyst, viewer
router.get("/", authorizeRoles("admin", "analyst", "viewer"), getReports);

// GET /api/v1/reports/:id — admin, analyst, viewer
router.get(
  "/:id",
  authorizeRoles("admin", "analyst", "viewer"),
  [param("id").isMongoId().withMessage("Invalid report ID format")],
  validateRequest,
  getReportById
);

// POST /api/v1/reports — admin, analyst
router.post(
  "/",
  authorizeRoles("admin", "analyst"),
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("type")
      .isIn([
        "attack_summary",
        "threat_intelligence",
        "honeypot_status",
        "compliance",
        "incident",
        "custom",
      ])
      .withMessage("Invalid report type"),
    body("format")
      .isIn(["pdf", "csv", "json", "html"])
      .withMessage("Unsupported report format"),
  ],
  validateRequest,
  createReport
);

// DELETE /api/v1/reports/:id — admin only
router.delete(
  "/:id",
  authorizeRoles("admin"),
  [param("id").isMongoId().withMessage("Invalid report ID format")],
  validateRequest,
  deleteReport
);

module.exports = router;
