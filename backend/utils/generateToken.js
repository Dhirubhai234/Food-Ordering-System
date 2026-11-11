const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT token
 * @param {string} userId - MongoDB user _id
 * @param {string} role - User role ("customer" | "admin")
 * @returns {string} Signed JWT token
 */
const generateToken = (userId, role = "customer") => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || "foodie_jwt_development_secret_key_2026",
    {
      expiresIn: "7d"
    }
  );
};

module.exports = generateToken;
