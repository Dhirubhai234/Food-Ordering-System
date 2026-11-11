const mongoose = require("mongoose");
const Food = require("../models/Food");

/**
 * @desc    Get all available food items (with optional category & search filter)
 * @route   GET /api/food
 * @access  Public
 */
const getFoods = async (req, res) => {
  try {
    const { category, search, isVeg, all } = req.query;
    let query = {};

    // For public customer catalog, filter available items only
    // If all=true (Admin view), fetch both available and unavailable items
    if (all !== "true") {
      query.isAvailable = true;
    }

    // Filter by Category
    if (category && category !== "All") {
      query.category = category;
    }

    // Filter by Veg / Non-Veg
    if (isVeg !== undefined) {
      query.isVeg = isVeg === "true";
    }

    // Filter by Search text in name or description
    if (search && search.trim() !== "") {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } }
      ];
    }

    const foods = await Food.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: foods.length,
      foods
    });
  } catch (error) {
    console.error("Get Foods Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching food items.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/**
 * @desc    Get single food item by ID
 * @route   GET /api/food/:id
 * @access  Public
 */
const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid food item ID format."
      });
    }

    const food = await Food.findById(id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found."
      });
    }

    res.status(200).json({
      success: true,
      food
    });
  } catch (error) {
    console.error("Get Food By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching food details.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/**
 * @desc    Create a new food item
 * @route   POST /api/food
 * @access  Private / Admin only
 */
const createFood = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      image,
      category,
      isAvailable,
      isVeg,
      rating,
      prepTime
    } = req.body;

    // Validation
    if (!name || !description || price === undefined || !image || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, description, price, image, and category."
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative."
      });
    }

    const validCategories = ["Pizza", "Burger", "Biryani", "Chinese", "Desserts", "Drinks"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(", ")}`
      });
    }

    const food = await Food.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      image: image.trim(),
      category,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isVeg: isVeg !== undefined ? isVeg : true,
      rating: rating ? Number(rating) : 4.5,
      prepTime: prepTime ? prepTime.trim() : "20-25 min"
    });

    res.status(201).json({
      success: true,
      message: "Food item created successfully",
      food
    });
  } catch (error) {
    console.error("Create Food Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating food item.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/**
 * @desc    Update existing food item
 * @route   PUT /api/food/:id
 * @access  Private / Admin only
 */
const updateFood = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid food item ID format."
      });
    }

    const food = await Food.findById(id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found."
      });
    }

    // Validate category if provided
    if (req.body.category) {
      const validCategories = ["Pizza", "Burger", "Biryani", "Chinese", "Desserts", "Drinks"];
      if (!validCategories.includes(req.body.category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${validCategories.join(", ")}`
        });
      }
    }

    // Validate price if provided
    if (req.body.price !== undefined && Number(req.body.price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative."
      });
    }

    const updatedFood = await Food.findByIdAndUpdate(
      id,
      { $set: req.body },
      { returnDocument: "after", runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Food item updated successfully",
      food: updatedFood
    });
  } catch (error) {
    console.error("Update Food Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating food item.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete a food item
 * @route   DELETE /api/food/:id
 * @access  Private / Admin only
 */
const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid food item ID format."
      });
    }

    const food = await Food.findById(id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found."
      });
    }

    await Food.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Food item deleted successfully"
    });
  } catch (error) {
    console.error("Delete Food Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting food item.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

module.exports = {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood
};
