const { Router } = require("express");
const { body, param } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");
const authenticateUser = require("../middleware/authenticateUser");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// GET /api/v1/users — admin, analyst, viewer
router.get("/", authorizeRoles("admin", "analyst", "viewer"), getUsers);

// GET /api/v1/users/:id — admin, analyst, viewer
router.get(
  "/:id",
  authorizeRoles("admin", "analyst", "viewer"),
  [param("id").isMongoId().withMessage("Invalid user ID format")],
  validateRequest,
  getUserById
);

// POST /api/v1/users — admin only
router.post(
  "/",
  authorizeRoles("admin"),
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("role")
      .optional()
      .isIn(["admin", "analyst", "viewer"])
      .withMessage("Invalid role"),
  ],
  validateRequest,
  createUser
);

// PUT /api/v1/users/:id — admin, analyst
router.put(
  "/:id",
  authorizeRoles("admin", "analyst"),
  [param("id").isMongoId().withMessage("Invalid user ID format")],
  validateRequest,
  updateUser
);

// DELETE /api/v1/users/:id — admin only
router.delete(
  "/:id",
  authorizeRoles("admin"),
  [param("id").isMongoId().withMessage("Invalid user ID format")],
  validateRequest,
  deleteUser
);

module.exports = router;
