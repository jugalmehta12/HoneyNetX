const crypto = require("crypto");

/**
 * Convert a raw Cowrie JSON event into the generic HoneyNetX
 * ingestion event format expected by mapper.js / eventProcessor.js.
 *
 * Cowrie fields:
 *   eventid, src_ip, dst_ip, src_port, dst_port,
 *   session, username, password, input, timestamp
 */
const normalizeEventType = (eventid) => {
  switch (eventid) {
    case "cowrie.session.connect":
      return "connection";

    case "cowrie.session.closed":
      return "connection";

    case "cowrie.login.success":
      return "login_success";

    case "cowrie.login.failed":
      return "login_attempt";

    case "cowrie.command.input":
      return "command";

    case "cowrie.file.upload":
      return "file_upload";

    case "cowrie.file.download":
      return "file_download";

    case "cowrie.direct-tcpip.request":
      return "connection";

    case "cowrie.log.closed":
      return "connection";

    default:
      return "sensor";
  }
};

/**
 * Generate a deterministic unique ID for a Cowrie event.
 *
 * Cowrie's `eventid` is a type, not a unique identifier.
 * Combining stable event fields prevents collisions while ensuring
 * the same log line produces the same HoneyNetX eventId.
 */
const generateEventId = (event) => {
  const fingerprint = [
    event.sensor || "",
    event.uuid || "",
    event.session || "",
    event.eventid || "",
    event.timestamp || "",
    event.input || "",
    event.username || "",
    event.src_ip || "",
    event.src_port || "",
  ].join("|");

  return crypto
    .createHash("sha256")
    .update(fingerprint)
    .digest("hex");
};

/**
 * Normalize a single raw Cowrie event.
 *
 * @param {Object} event
 * @returns {Object}
 */
const normalizeCowrieEvent = (event) => {
  const eventType = normalizeEventType(event.eventid);

  return {
    eventId: generateEventId(event),

    source: "cowrie",

    srcIp: event.src_ip,
    dstIp: event.dst_ip,

    srcPort: event.src_port,
    dstPort: event.dst_port,

    // AttackLog currently models transport protocol.
    // SSH is preserved separately in metadata.
    protocol: "tcp",

    sessionId: event.session,

    eventType,

    username: event.username,
    password: event.password,

    command: event.input,

    timestamp: event.timestamp,

    metadata: {
      cowrieEventId: event.eventid,
      sensor: event.sensor,
      uuid: event.uuid,
      applicationProtocol: event.protocol,
      message: event.message,
      hassh: event.hassh,
      hasshAlgorithms: event.hasshAlgorithms,
      arch: event.arch,
      name: event.name,
      value: event.value,
      width: event.width,
      height: event.height,
      ttylog: event.ttylog,
      size: event.size,
      shasum: event.shasum,
      durationMs: event.duration_ms,
      duplicate: event.duplicate,
    },
  };
};

module.exports = {
  normalizeCowrieEvent,
};