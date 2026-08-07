/**
 * JSON / JSONL parser for the ingestion pipeline.
 * Handles malformed input gracefully — never throws.
 */

/**
 * Parse a single line of text as JSON.
 * @param {string} line - Raw text line
 * @returns {{ success: boolean, data: Object|null, error: string|null }}
 */
const parseLine = (line) => {
  if (!line || typeof line !== "string") {
    return { success: false, data: null, error: "Empty or invalid input" };
  }

  const trimmed = line.trim();

  if (trimmed.length === 0) {
    return { success: false, data: null, error: "Empty line" };
  }

  try {
    const parsed = JSON.parse(trimmed);

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { success: false, data: null, error: "Parsed value is not a plain object" };
    }

    return { success: true, data: parsed, error: null };
  } catch (err) {
    return { success: false, data: null, error: `JSON parse error: ${err.message}` };
  }
};

/**
 * Parse a batch of newline-delimited JSON (JSONL).
 * @param {string} raw - Raw text block
 * @returns {{ successful: Object[], failed: Array<{ line: string, error: string }> }}
 */
const parseJsonl = (raw) => {
  const lines = raw.split("\n");
  const successful = [];
  const failed = [];

  for (const line of lines) {
    const result = parseLine(line);
    if (result.success) {
      successful.push(result.data);
    } else if (line.trim().length > 0) {
      // Only record failures for non-empty lines
      failed.push({ line: line.trim(), error: result.error });
    }
  }

  return { successful, failed };
};

/**
 * Parse a plain JSON array.
 * @param {string} raw - Raw text (expected: JSON array)
 * @returns {{ successful: Object[], failed: Array<{ line: string, error: string }> }}
 */
const parseJson = (raw) => {
  try {
    const parsed = JSON.parse(raw.trim());

    if (!Array.isArray(parsed)) {
      return { successful: [], failed: [{ line: raw.trim(), error: "Input is not a JSON array" }] };
    }

    const successful = [];
    const failed = [];

    for (const item of parsed) {
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        successful.push(item);
      } else {
        failed.push({ line: JSON.stringify(item), error: "Array element is not a plain object" });
      }
    }

    return { successful, failed };
  } catch (err) {
    return { successful: [], failed: [{ line: raw.trim(), error: `JSON parse error: ${err.message}` }] };
  }
};

module.exports = { parseLine, parseJsonl, parseJson };
