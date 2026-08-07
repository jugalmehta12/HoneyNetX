const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const config = require("./config");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/requestLogger");

// Route modules
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const attackRoutes = require("./routes/attack.routes");
const honeypotRoutes = require("./routes/honeypot.routes");
const reportRoutes = require("./routes/report.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({ origin: config.corsOrigin, credentials: true }));

// Request logging — Winston access log (writes to access.log)
app.use(requestLogger);

// Morgan — console output for development
app.use(morgan(config.logLevel));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Versioned API routes ───────────────────────────────────────────
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/attacks", attackRoutes);
app.use("/api/v1/honeypots", honeypotRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/users", userRoutes);

// Legacy health check (kept for backward compat)
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
