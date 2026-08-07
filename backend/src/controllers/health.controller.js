const { successResponse } = require("../utils/apiResponse");

/**
 * GET /api/v1/health
 * Readiness probe for load balancers and orchestrators.
 */
const getHealth = (_req, res) => {
  return successResponse(res, 200, "HoneyNetX API is running");
};

module.exports = { getHealth };
