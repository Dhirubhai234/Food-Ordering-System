const mongoose = require("mongoose");

/**
 * Connect to MongoDB database via Mongoose
 * Includes automatic primary node discovery retry for Atlas M0 clusters
 */
const connectDB = async (retries = 6) => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri || uri.includes("your_mongodb_connection_string")) {
    console.error("❌ MONGO_URI is not configured in your environment variables (.env).");
    throw new Error("MONGO_URI is missing or contains placeholder in backend/.env");
  }

  // Setup Mongoose connection event listeners
  mongoose.connection.on("connected", () => {
    console.log("📦 Mongoose event: Connection established successfully.");
  });

  mongoose.connection.on("error", (err) => {
    console.error(`❌ Mongoose connection error: ${err.message}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  Mongoose event: Lost connection to MongoDB.");
  });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        family: 4 // Forces IPv4 on Windows for reliable DNS/TLS handshake
      });

      console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
      console.log(`🗄️  Database Name: ${conn.connection.name}`);
      return conn;
    } catch (error) {
      if (attempt < retries) {
        console.warn(`⏳ Primary node discovery attempt ${attempt}/${retries}... retrying in 2s`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        console.error(`❌ MongoDB Initial Connection Failed: ${error.message}`);
        throw error;
      }
    }
  }
};

module.exports = connectDB;
