const express = require("express");
const {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood
} = require("../controllers/foodController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", getFoods);
router.get("/:id", getFoodById);

// Protected Admin routes
router.post("/", protect, adminOnly, createFood);
router.put("/:id", protect, adminOnly, updateFood);
router.delete("/:id", protect, adminOnly, deleteFood);

module.exports = router;
