const { Router } = require("express");
const { body, param } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");
const authenticateUser = require("../middleware/authenticateUser");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
  getAttacks,
  getAttackById,
  createAttack,
  updateAttack,
  deleteAttack,
} = require("../controllers/attack.controller");

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// GET /api/v1/attacks — admin, analyst, viewer
router.get("/", authorizeRoles("admin", "analyst", "viewer"), getAttacks);

// GET /api/v1/attacks/:id — admin, analyst, viewer
router.get(
  "/:id",
  authorizeRoles("admin", "analyst", "viewer"),
  [param("id").isMongoId().withMessage("Invalid attack ID format")],
  validateRequest,
  getAttackById
);

// POST /api/v1/attacks — admin, analyst
router.post(
  "/",
  authorizeRoles("admin", "analyst"),
  [
    body("eventId").notEmpty().withMessage("Event ID is required"),
    body("srcIp").notEmpty().withMessage("Source IP is required"),
    body("eventType").notEmpty().withMessage("Event type is required"),
  ],
  validateRequest,
  createAttack
);

// PUT /api/v1/attacks/:id — admin, analyst
router.put(
  "/:id",
  authorizeRoles("admin", "analyst"),
  [param("id").isMongoId().withMessage("Invalid attack ID format")],
  validateRequest,
  updateAttack
);

// DELETE /api/v1/attacks/:id — admin only
router.delete(
  "/:id",
  authorizeRoles("admin"),
  [param("id").isMongoId().withMessage("Invalid attack ID format")],
  validateRequest,
  deleteAttack
);

module.exports = router;
