const mockSettings = {
  profile: {
    name: "Alex Morgan",
    role: "Security Analyst",
    email: "alex.morgan@honeynetx.io",
    avatar: "AM",
    department: "Security Operations",
    joinDate: "2025-03-15",
  },
  appearance: {
    theme: "dark",
    compactMode: false,
    sidebarCollapsed: false,
    language: "en",
  },
  notifications: {
    emailAlerts: true,
    criticalAlerts: true,
    weeklyReports: true,
    attackSummaries: false,
    systemUpdates: true,
  },
  api: {
    backendUrl: "http://localhost:3001",
    mongoStatus: "Connected",
    connectionStatus: "Online",
    lastSync: "2026-08-06T22:45:00Z",
    apiKey: "hnx_prod_••••••••••••••••",
  },
  systemStatus: {
    frontend: { status: "Running", version: "1.0.0", uptime: "14d 6h 32m" },
    backend: { status: "Running", version: "2.1.3", uptime: "14d 6h 30m" },
    database: { status: "Connected", version: "7.0.12", uptime: "30d 12h 15m" },
    cowrie: { status: "Running", version: "3.0.1", uptime: "14d 6h 32m" },
  },
  security: {
    sessionTimeout: 30,
    autoLogout: true,
    twoFactorEnabled: false,
    passwordLastChanged: "2026-07-15",
    loginAttempts: 0,
  },
  about: {
    version: "1.0.0",
    build: "2026.08.06",
    license: "MIT",
    team: "HoneyNetX Security Team",
    website: "https://honeynetx.io",
  },
};

export default mockSettings;
