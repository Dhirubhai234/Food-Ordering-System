const express = require("express");
const { register, login, getProfile, getAllUsers } = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Private profile route
router.get("/me", protect, getProfile);

// Admin-only user management route
router.get("/users", protect, adminOnly, getAllUsers);

module.exports = router;
