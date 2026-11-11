const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables from backend/.env
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Foodie Backend API",
    version: "1.0.0"
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Food Ordering API is running"
  });
});

// Authentication routes
app.use("/api/auth", require("./routes/authRoutes"));

// Food management routes
app.use("/api/food", require("./routes/foodRoutes"));

// Order management routes
app.use("/api/orders", require("./routes/orderRoutes"));

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found"
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

/**
 * Initialize MongoDB connection first before listening for HTTP requests
 */
const startServer = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await connectDB();
    console.log("✅ Database initialized successfully.");
  } catch (error) {
    console.warn("⚠️  Server starting in Offline Database mode.");
    console.warn("👉 Please configure a working MONGODB_URI in backend/.env to enable database persistence.");
  }

  app.listen(PORT, () => {
    console.log(`🚀 Foodie API Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  });
};

startServer();
