const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect middleware: Verifies JWT token and attaches authenticated user to req.user
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "foodie_jwt_development_secret_key_2026"
      );

      // Fetch user without password
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User account no longer exists."
        });
      }

      return next();
    } catch (error) {
      console.error("JWT Verification error:", error.message);
      return res.status(401).json({
        success: false,
        message: "Not authorized: Invalid or expired token."
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized: No authentication token provided."
    });
  }
};

/**
 * Role-based authorization middleware (e.g. for Admin food creation)
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Forbidden: Admin privileges required."
    });
  }
};

module.exports = { protect, adminOnly };
