export const attackTimeline = [
  { time: "00:00", attacks: 42, critical: 5, blocked: 12 },
  { time: "01:00", attacks: 38, critical: 3, blocked: 10 },
  { time: "02:00", attacks: 25, critical: 2, blocked: 8 },
  { time: "03:00", attacks: 18, critical: 1, blocked: 5 },
  { time: "04:00", attacks: 15, critical: 1, blocked: 4 },
  { time: "05:00", attacks: 22, critical: 2, blocked: 7 },
  { time: "06:00", attacks: 35, critical: 4, blocked: 11 },
  { time: "07:00", attacks: 58, critical: 7, blocked: 18 },
  { time: "08:00", attacks: 89, critical: 12, blocked: 28 },
  { time: "09:00", attacks: 124, critical: 18, blocked: 42 },
  { time: "10:00", attacks: 156, critical: 22, blocked: 54 },
  { time: "11:00", attacks: 178, critical: 28, blocked: 62 },
  { time: "12:00", attacks: 145, critical: 20, blocked: 48 },
  { time: "13:00", attacks: 162, critical: 25, blocked: 55 },
  { time: "14:00", attacks: 189, critical: 32, blocked: 65 },
  { time: "15:00", attacks: 201, critical: 35, blocked: 72 },
  { time: "16:00", attacks: 175, critical: 28, blocked: 58 },
  { time: "17:00", attacks: 142, critical: 20, blocked: 45 },
  { time: "18:00", attacks: 118, critical: 15, blocked: 38 },
  { time: "19:00", attacks: 95, critical: 12, blocked: 30 },
  { time: "20:00", attacks: 78, critical: 8, blocked: 24 },
  { time: "21:00", attacks: 65, critical: 6, blocked: 20 },
  { time: "22:00", attacks: 52, critical: 5, blocked: 16 },
  { time: "23:00", attacks: 48, critical: 4, blocked: 14 },
];

export const attackTypeDistribution = [
  { name: "Brute Force", value: 142, color: "#EF4444" },
  { name: "SQL Injection", value: 45, color: "#F59E0B" },
  { name: "Command Injection", value: 38, color: "#3B82F6" },
  { name: "Path Traversal", value: 32, color: "#8B5CF6" },
  { name: "XSS Attack", value: 28, color: "#22C55E" },
  { name: "Credential Stuffing", value: 24, color: "#EC4899" },
  { name: "DDoS Attempt", value: 18, color: "#14B8A6" },
  { name: "Other", value: 15, color: "#64748B" },
];

export const protocolDistribution = [
  { name: "SSH", value: 185, color: "#3B82F6" },
  { name: "HTTP", value: 142, color: "#22C55E" },
  { name: "FTP", value: 68, color: "#F59E0B" },
  { name: "RDP", value: 52, color: "#EF4444" },
  { name: "Telnet", value: 38, color: "#8B5CF6" },
  { name: "MySQL", value: 28, color: "#EC4899" },
  { name: "SMB", value: 22, color: "#14B8A6" },
  { name: "Other", value: 18, color: "#64748B" },
];

export const topCountries = [
  { country: "Russia", attacks: 156, percentage: 28.4 },
  { country: "China", attacks: 124, percentage: 22.6 },
  { country: "United States", attacks: 89, percentage: 16.2 },
  { country: "Brazil", attacks: 52, percentage: 9.5 },
  { country: "India", attacks: 45, percentage: 8.2 },
  { country: "Netherlands", attacks: 32, percentage: 5.8 },
  { country: "Germany", attacks: 28, percentage: 5.1 },
  { country: "Ukraine", attacks: 22, percentage: 4.0 },
];

export const topAttackTypes = [
  { type: "Brute Force", count: 142, severity: "Critical" },
  { type: "SQL Injection", count: 45, severity: "High" },
  { type: "Command Injection", count: 38, severity: "Critical" },
  { type: "Path Traversal", count: 32, severity: "Medium" },
  { type: "XSS Attack", count: 28, severity: "Medium" },
  { type: "Credential Stuffing", count: 24, severity: "High" },
  { type: "DDoS Attempt", count: 18, severity: "Critical" },
  { type: "Port Scanning", count: 15, severity: "Low" },
];

export const mostTargetedPorts = [
  { port: 22, protocol: "SSH", count: 185, risk: "High" },
  { port: 80, protocol: "HTTP", count: 142, risk: "Medium" },
  { port: 443, protocol: "HTTPS", count: 98, risk: "Medium" },
  { port: 21, protocol: "FTP", count: 68, risk: "High" },
  { port: 3389, protocol: "RDP", count: 52, risk: "Critical" },
  { port: 3306, protocol: "MySQL", count: 45, risk: "High" },
  { port: 23, protocol: "Telnet", count: 38, risk: "Critical" },
  { port: 8080, protocol: "HTTP-Alt", count: 35, risk: "Medium" },
  { port: 5432, protocol: "PostgreSQL", count: 28, risk: "High" },
  { port: 6379, protocol: "Redis", count: 22, risk: "Critical" },
];

export const summaryStats = {
  totalAttacks: 2184,
  totalAttacksTrend: 12.5,
  criticalAlerts: 186,
  criticalAlertsTrend: 8.3,
  blockedThreats: 682,
  blockedThreatsTrend: 15.2,
  uniqueAttackers: 428,
  uniqueAttackersTrend: -3.1,
};

export const threatScore = {
  overall: 78,
  trend: 5.2,
  factors: [
    { name: "Attack Volume", score: 82, weight: 30 },
    { name: "Severity Distribution", score: 75, weight: 25 },
    { name: "Geographic Spread", score: 68, weight: 20 },
    { name: "Protocol Diversity", score: 85, weight: 15 },
    { name: "Time Concentration", score: 72, weight: 10 },
  ],
};

export const recentTrends = {
  hourly: {
    current: 52,
    previous: 48,
    change: 8.3,
  },
  daily: {
    current: 2184,
    previous: 1942,
    change: 12.5,
  },
  weekly: {
    current: 14523,
    previous: 12876,
    change: 12.8,
  },
  monthly: {
    current: 58412,
    previous: 52145,
    change: 12.0,
  },
};
