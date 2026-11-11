const mongoose = require("mongoose");
const Order = require("../models/Order");
const Food = require("../models/Food");

/**
 * @desc    Place a new food order
 * @route   POST /api/orders
 * @access  Private (Logged-in customer)
 */
const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body;

    // 1. Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item."
      });
    }

    // 2. Validate delivery address
    if (
      !deliveryAddress ||
      !deliveryAddress.street ||
      !deliveryAddress.city ||
      !deliveryAddress.pincode ||
      !deliveryAddress.phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a complete delivery address with street, city, pincode, and contact phone."
      });
    }

    // 3. Process items & Calculate totalAmount strictly using database prices
    let calculatedTotal = 0;
    const verifiedOrderItems = [];

    for (const item of items) {
      // Validate food ID format
      if (!item.food || !mongoose.Types.ObjectId.isValid(item.food)) {
        return res.status(400).json({
          success: false,
          message: `Invalid or missing food ID: ${item.food}`
        });
      }

      // Validate quantity
      const qty = Number(item.quantity);
      if (!qty || qty < 1) {
        return res.status(400).json({
          success: false,
          message: "Item quantity must be at least 1."
        });
      }

      // Fetch authentic food item from database
      const foodDoc = await Food.findById(item.food);
      if (!foodDoc) {
        return res.status(404).json({
          success: false,
          message: `Food item not found for ID: ${item.food}`
        });
      }

      // Check food item availability
      if (!foodDoc.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Sorry, "${foodDoc.name}" is currently out of stock.`
        });
      }

      // Strictly enforce database price (ignore any price sent by client)
      const officialPrice = Number(foodDoc.price);
      calculatedTotal += officialPrice * qty;

      verifiedOrderItems.push({
        food: foodDoc._id,
        name: foodDoc.name,
        price: officialPrice,
        quantity: qty,
        image: foodDoc.image
      });
    }

    // 4. Create Order in MongoDB
    const order = await Order.create({
      user: req.user._id,
      items: verifiedOrderItems,
      totalAmount: calculatedTotal,
      deliveryAddress: {
        street: deliveryAddress.street.trim(),
        city: deliveryAddress.city.trim(),
        state: deliveryAddress.state ? deliveryAddress.state.trim() : "Delhi",
        pincode: deliveryAddress.pincode.trim(),
        phone: deliveryAddress.phone.trim()
      },
      paymentMethod: paymentMethod || "COD",
      paymentStatus: "Pending",
      status: "Confirmed"
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while placing order.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/**
 * @desc    Get orders for currently logged-in user
 * @route   GET /api/orders/myorders
 * @access  Private (Logged-in customer)
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching your orders."
    });
  }
};

/**
 * @desc    Get specific order details by ID
 * @route   GET /api/orders/:id
 * @access  Private (Owner or Admin)
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format."
      });
    }

    const order = await Order.findById(id).populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found."
      });
    }

    // Ensure users can only view their own orders unless they have admin role
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You are not authorized to view this order."
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Get Order By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching order details."
    });
  }
};

/**
 * @desc    Get all orders across all users
 * @route   GET /api/orders
 * @access  Private / Admin only
 */
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching all orders."
    });
  }
};

/**
 * @desc    Update order delivery / fulfillment status
 * @route   PUT /api/orders/:id/status
 * @access  Private / Admin only
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format."
      });
    }

    const validStatuses = ["Confirmed", "Preparing", "On Way", "Delivered", "Cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found."
      });
    }

    order.status = status;
    if (status === "Delivered" && order.paymentMethod === "COD") {
      order.paymentStatus = "Completed";
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}"`,
      order: updatedOrder
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating order status."
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
};
