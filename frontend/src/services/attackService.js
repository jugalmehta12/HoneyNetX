import api from "./api";

const EVENT_LABELS = {
  login_attempt: "Failed Login Attempt",
  login_success: "Successful Login",
  command: "Command Input",
  file_upload: "File Upload",
  file_download: "File Download",
  connection: "Connection",
  scan: "Scan",
  exploit: "Exploit",
  sensor: "Sensor Event",
  other: "Other Event",
};

const capitalize = (value) => {
  const text = String(value || "low");
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export function mapAttackRecord(record) {
  const eventType = record.eventType || "other";
  const appProtocol =
    record.metadata?.applicationProtocol ||
    (Number(record.dstPort) === 22 ? "ssh" : record.protocol || "tcp");

  return {
    ...record,
    id: record._id || record.eventId,
    timestamp: record.timestamp || record.createdAt || new Date().toISOString(),
    sourceIp: record.srcIp || "Unknown",
    country: record.country || "Unknown",
    protocol: String(appProtocol).toUpperCase(),
    attackType: EVENT_LABELS[eventType] || eventType.replace(/_/g, " "),
    username: record.username || "N/A",
    severity: capitalize(record.severity),
    status: record.status || "New",
    port: record.dstPort ?? "N/A",
  };
}

export async function fetchAttacks({ page = 1, limit = 100 } = {}) {
  const response = await api.get("/v1/attacks", {
    params: { page, limit, sort: "-timestamp" },
  });
  const payload = response.data?.data;
  const records = Array.isArray(payload?.attacks) ? payload.attacks : [];

  return {
    attacks: records.map(mapAttackRecord),
    pagination: payload?.pagination || { total: records.length, page, limit },
  };
}
