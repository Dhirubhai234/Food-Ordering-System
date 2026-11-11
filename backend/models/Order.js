const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Food",
    required: [true, "Food reference ID is required"]
  },
  name: {
    type: String,
    required: [true, "Item name is required"],
    trim: true
  },
  price: {
    type: Number,
    required: [true, "Item price is required"],
    min: [0, "Item price cannot be negative"]
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"]
  },
  image: {
    type: String,
    trim: true
  }
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must be linked to a user"]
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: "An order must contain at least one item"
      }
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"]
    },
    deliveryAddress: {
      street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true
      },
      state: {
        type: String,
        default: "Delhi",
        trim: true
      },
      pincode: {
        type: String,
        required: [true, "Pincode is required"],
        trim: true
      },
      phone: {
        type: String,
        required: [true, "Delivery contact phone number is required"],
        trim: true
      }
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "Card"],
      default: "COD"
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending"
    },
    status: {
      type: String,
      enum: {
        values: [
          "Confirmed",
          "Preparing",
          "On Way",
          "Delivered",
          "Cancelled"
        ],
        message: "{VALUE} is not a valid order status"
      },
      default: "Confirmed"
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
