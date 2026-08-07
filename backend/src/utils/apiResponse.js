/**
 * Standardised API response helpers.
 * Every controller should use these to guarantee a consistent JSON shape
 * across the entire HoneyNetX API.
 */

/**
 * Send a success response.
 * @param {import("express").Response} res
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {string} message    - Human-readable message
 * @param {*}      data       - Payload (object, array, null)
 * @returns {import("express").Response}
 */
const successResponse = (res, statusCode = 200, message = "OK", data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send an error response.
 * @param {import("express").Response} res
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {string} message    - Human-readable error message
 * @param {Array|Object|null} errors - Optional validation / detail errors
 * @returns {import("express").Response}
 */
const errorResponse = (res, statusCode = 500, message = "Internal Server Error", errors = null) => {
  const body = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    body.errors = errors;
  }

  return res.status(statusCode).json(body);
};

module.exports = { successResponse, errorResponse };
