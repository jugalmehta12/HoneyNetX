const { errorResponse } = require("../utils/apiResponse");

/**
 * Role-based authorization middleware.
 * Must be placed AFTER authenticateUser so that req.user is populated.
 *
 * Usage:
 *   router.delete("/:id", authenticateUser, authorizeRoles("admin"), deleteHandler);
 *   router.put("/:id", authenticateUser, authorizeRoles("admin", "analyst"), updateHandler);
 *
 * @param  {...string} roles - Allowed roles (e.g. "admin", "analyst", "viewer")
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, "Authentication required before authorization.");
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Role '${req.user.role}' is not authorised to access this resource.`
      );
    }

    next();
  };
};

module.exports = authorizeRoles;
