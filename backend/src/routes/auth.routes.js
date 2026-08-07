const { Router } = require("express");
const { body } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");
const authenticateUser = require("../middleware/authenticateUser");
const {
  register,
  login,
  logout,
  refresh,
  getMe,
} = require("../controllers/auth.controller");

const router = Router();

// POST /api/v1/auth/register
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("role")
      .optional()
      .isIn(["admin", "analyst", "viewer"])
      .withMessage("Invalid role"),
  ],
  validateRequest,
  register
);

// POST /api/v1/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  login
);

// POST /api/v1/auth/logout
router.post("/logout", logout);

// POST /api/v1/auth/refresh
router.post(
  "/refresh",
  [body("refreshToken").notEmpty().withMessage("Refresh token is required")],
  validateRequest,
  refresh
);

// GET /api/v1/auth/me
router.get("/me", authenticateUser, getMe);

module.exports = router;
