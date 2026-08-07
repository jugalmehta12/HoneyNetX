const { validationResult } = require("express-validator");
const { errorResponse } = require("../utils/apiResponse");

/**
 * Middleware that checks for express-validator validation errors.
 * Place after validation chain rules in route definitions.
 *
 * Usage:
 *   router.get("/:id", [param("id").isMongoId()], validateRequest, controller.getOne);
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return errorResponse(res, 400, "Validation failed", errors.array());
  }

  next();
};

module.exports = validateRequest;
