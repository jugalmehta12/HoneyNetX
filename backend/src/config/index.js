require("dotenv").config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/honeynetx",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  logLevel: process.env.LOG_LEVEL || "dev",

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "honeynetx-access-secret-dev",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "honeynetx-refresh-secret-dev",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
};

module.exports = config;
