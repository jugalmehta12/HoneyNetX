const { Router } = require("express");
const { body, param } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");
const authenticateUser = require("../middleware/authenticateUser");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
  getHoneypots,
  getHoneypotById,
  createHoneypot,
  updateHoneypot,
  deleteHoneypot,
} = require("../controllers/honeypot.controller");

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// GET /api/v1/honeypots — admin, analyst, viewer
router.get("/", authorizeRoles("admin", "analyst", "viewer"), getHoneypots);

// GET /api/v1/honeypots/:id — admin, analyst, viewer
router.get(
  "/:id",
  authorizeRoles("admin", "analyst", "viewer"),
  [param("id").isMongoId().withMessage("Invalid honeypot ID format")],
  validateRequest,
  getHoneypotById
);

// POST /api/v1/honeypots — admin, analyst
router.post(
  "/",
  authorizeRoles("admin", "analyst"),
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("engine")
      .isIn(["cowrie", "dionaea", "honeypy", "honeyd", "custom"])
      .withMessage("Unsupported honeypot engine"),
    body("ipAddress").notEmpty().withMessage("IP address is required"),
  ],
  validateRequest,
  createHoneypot
);

// PUT /api/v1/honeypots/:id — admin, analyst
router.put(
  "/:id",
  authorizeRoles("admin", "analyst"),
  [param("id").isMongoId().withMessage("Invalid honeypot ID format")],
  validateRequest,
  updateHoneypot
);

// DELETE /api/v1/honeypots/:id — admin only
router.delete(
  "/:id",
  authorizeRoles("admin"),
  [param("id").isMongoId().withMessage("Invalid honeypot ID format")],
  validateRequest,
  deleteHoneypot
);

module.exports = router;
