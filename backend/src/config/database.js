const mongoose = require("mongoose");
const config = require("./index");

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

let retryCount = 0;

const connectDatabase = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    retryCount = 0;
    console.log(`MongoDB connected: ${config.mongodbUri}`);
  } catch (err) {
    retryCount++;

    if (retryCount <= MAX_RETRIES) {
      console.error(
        `MongoDB connection failed (attempt ${retryCount}/${MAX_RETRIES}). Retrying in ${RETRY_DELAY_MS / 1000}s...`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDatabase();
    }

    console.error("MongoDB connection failed after maximum retries. Exiting.");
    console.error(err.message);
    process.exit(1);
  }
};

// Connection event listeners
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected.");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected.");
});

// Graceful shutdown
const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected gracefully.");
  } catch (err) {
    console.error("Error during MongoDB disconnect:", err.message);
  }
};

module.exports = { connectDatabase, disconnectDatabase };
