/**
 * Reusable query builder for Mongoose list endpoints.
 * Provides pagination, search, filtering, sorting, and date-range
 * filtering in a single composable helper.
 *
 * Usage in a controller:
 *   const { filter, pagination, sort } = buildQuery(req.query);
 *   const [docs, total] = await Promise.all([
 *     AttackLog.find(filter).sort(sort).skip(pagination.skip).limit(pagination.limit),
 *     AttackLog.countDocuments(filter),
 *   ]);
 */

/**
 * Allowed date fields per model — used for date-range filtering.
 * Keys are model names, values are the field names that accept Date queries.
 */
const DATE_FIELDS = {
  AttackLog: ["timestamp", "updatedAt"],
  Honeypot: ["lastHeartbeat", "createdAt", "updatedAt"],
  Report: ["dateRange.from", "dateRange.to", "createdAt", "updatedAt"],
  User: ["lastLoginAt", "createdAt", "updatedAt"],
};

/**
 * Build a Mongoose-ready query object from Express query params.
 * @param {Object}      query             - req.query
 * @param {string}      modelName         - Mongoose model name (for date field lookup)
 * @param {string[]}    searchableFields  - Fields to apply $regex search on
 * @param {string[]}    filterableFields  - Exact-match fields allowed as query params
 * @returns {{ filter: Object, pagination: Object, sort: Object }}
 */
const buildQuery = (query, modelName, searchableFields = [], filterableFields = []) => {
  const filter = {};
  const { page = 1, limit = 20, sort: sortParam, search, startDate, endDate, ...rest } = query;

  // ── Pagination ────────────────────────────────────────────────────
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  // ── Text / regex search ──────────────────────────────────────────
  if (search && searchableFields.length > 0) {
    const regex = new RegExp(search, "i");
    filter.$or = searchableFields.map((field) => ({ [field]: regex }));
  }

  // ── Date range filtering ─────────────────────────────────────────
  const dateFields = DATE_FIELDS[modelName] || [];

  if (startDate || endDate) {
    // If caller specified a date field in the query, use it; otherwise use the
    // first date field in the model's list (typically the primary timestamp).
    const dateField = dateFields[0] || "createdAt";
    const rangeFilter = {};
    if (startDate) rangeFilter.$gte = new Date(startDate);
    if (endDate) rangeFilter.$lte = new Date(endDate);
    filter[dateField] = rangeFilter;
  }

  // ── Exact-match filters ──────────────────────────────────────────
  for (const field of filterableFields) {
    if (rest[field] !== undefined && rest[field] !== "") {
      filter[field] = rest[field];
    }
  }

  // ── Sorting ──────────────────────────────────────────────────────
  let sort = { createdAt: -1 }; // default: newest first
  if (sortParam) {
    // Accept "-fieldName" for descending, "fieldName" for ascending
    const order = sortParam.startsWith("-") ? -1 : 1;
    const field = sortParam.replace(/^-/, "");
    sort = { [field]: order };
  }

  return {
    filter,
    pagination: { page: pageNum, limit: limitNum, skip },
    sort,
  };
};

/**
 * Build a pagination metadata envelope.
 * @param {number} total   - Total document count
 * @param {Object} pagination - { page, limit }
 * @returns {Object}
 */
const paginateMeta = (total, { page, limit }) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = { buildQuery, paginateMeta };
