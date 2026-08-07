/**
 * Event mapper — converts generic parsed events into the internal
 * AttackLog structure. Designed to be source-agnostic: no Cowrie
 * field names are referenced. Each source plugin provides its own
 * mapping rules via a strategy object.
 */

// ── Severity inference from event type ────────────────────────────
const SEVERITY_MAP = {
  login_attempt: "medium",
  login_success: "high",
  command: "high",
  file_upload: "high",
  file_download: "medium",
  connection: "low",
  scan: "medium",
  exploit: "critical",
  sensor: "low",
  other: "low",
};

/**
 * Infer severity from event type when not provided.
 * @param {string} eventType
 * @returns {string}
 */
const inferSeverity = (eventType) => SEVERITY_MAP[eventType] || "low";

/**
 * Map a generic parsed event to the AttackLog structure.
 *
 * Expected generic fields (source-agnostic):
 *   - eventId    {string}  Unique event identifier
 *   - source     {string}  Honeypot engine name (cowrie|dionaea|...)
 *   - srcIp      {string}  Attacker source IP
 *   - dstIp      {string}  Honeypot destination IP
 *   - srcPort    {number}  Attacker source port (optional)
 *   - dstPort    {number}  Honeypot target port (optional)
 *   - protocol   {string}  tcp|udp|icmp|other (optional)
 *   - sessionId  {string}  Session correlation key (optional)
 *   - eventType  {string}  Event category (optional, defaults to "other")
 *   - severity   {string}  low|medium|high|critical (optional, inferred)
 *   - username   {string}  Captured username (optional)
 *   - password   {string}  Captured password (optional)
 *   - command    {string}  Executed command (optional)
 *   - timestamp  {string}  ISO timestamp (optional, defaults to now)
 *   - metadata   {object}  Additional key-value pairs (optional)
 *
 * @param {Object} event - Parsed event from the log source
 * @returns {{ source, destination, protocol, eventType, severity, metadata, rawLog, timestamp }}
 */
const mapEvent = (event) => {
  const eventType = normalizeEventType(event.eventType);
  const severity = event.severity || inferSeverity(eventType);

  return {
    source: String(event.source || "custom").toLowerCase().trim(),
    destination: {
      srcIp: String(event.srcIp || "").trim(),
      dstIp: String(event.dstIp || "").trim(),
      srcPort: toNumber(event.srcPort),
      dstPort: toNumber(event.dstPort),
    },
    protocol: normalizeProtocol(event.protocol),
    sessionId: event.sessionId || undefined,
    eventType,
    severity,
    username: event.username || undefined,
    password: event.password || undefined,
    command: event.command || undefined,
    metadata: typeof event.metadata === "object" ? event.metadata : {},
    rawLog: event,
    timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
  };
};

/**
 * Map an array of events.
 * @param {Object[]} events
 * @returns {Object[]}
 */
const mapEvents = (events) => events.map(mapEvent);

// ── Helpers ───────────────────────────────────────────────────────

const VALID_EVENT_TYPES = [
  "login_attempt",
  "login_success",
  "command",
  "file_upload",
  "file_download",
  "connection",
  "scan",
  "exploit",
  "sensor",
  "other",
];

const normalizeEventType = (val) => {
  if (!val || typeof val !== "string") return "other";
  const normalized = val.toLowerCase().trim();
  return VALID_EVENT_TYPES.includes(normalized) ? normalized : "other";
};

const VALID_PROTOCOLS = ["tcp", "udp", "icmp", "other"];

const normalizeProtocol = (val) => {
  if (!val || typeof val !== "string") return "tcp";
  const normalized = val.toLowerCase().trim();
  return VALID_PROTOCOLS.includes(normalized) ? normalized : "other";
};

const toNumber = (val) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
};

module.exports = { mapEvent, mapEvents };
