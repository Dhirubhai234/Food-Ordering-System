const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Food name is required"],
      trim: true,
      maxlength: [100, "Food name cannot exceed 100 characters"]
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"]
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"]
    },
    image: {
      type: String,
      required: [true, "Food image URL is required"],
      trim: true
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["Pizza", "Burger", "Biryani", "Chinese", "Desserts", "Drinks"],
        message: "{VALUE} is not a supported category"
      }
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    isVeg: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1.0, "Rating must be at least 1.0"],
      max: [5.0, "Rating cannot exceed 5.0"]
    },
    prepTime: {
      type: String,
      default: "20-25 min",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Food = mongoose.model("Food", foodSchema);

module.exports = Food;
