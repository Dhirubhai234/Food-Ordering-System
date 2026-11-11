import React, { useState, useEffect } from "react";
import { foodAPI, orderAPI, authAPI } from "../services/api";
import "./AdminDashboard.css";

const CATEGORIES = ["Pizza", "Burger", "Biryani", "Chinese", "Desserts", "Drinks"];
const ORDER_STATUSES = ["Confirmed", "Preparing", "On Way", "Delivered", "Cancelled"];

const AdminDashboard = ({ user, onNavigateHome, onShowToast }) => {
  // Navigation / Tab state
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "orders", "foods", "users"

  // Data states
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [foodCategoryFilter, setFoodCategoryFilter] = useState("All");
  const [foodSearchTerm, setFoodSearchTerm] = useState("");

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [foodModal, setFoodModal] = useState({
    isOpen: false,
    mode: "add", // "add" or "edit"
    data: {
      name: "",
      category: "Pizza",
      price: "",
      description: "",
      image: "",
      isVeg: true,
      isAvailable: true,
      prepTime: "20-25 min",
      rating: 4.5
    }
  });

  const [savingFood, setSavingFood] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Access Control: Block non-admins immediately
  if (!user || user.role !== "admin") {
    return (
      <div className="admin-access-denied">
        <div className="denied-card">
          <div className="denied-icon">🚫</div>
          <h2>Restricted Access</h2>
          <p>You must be an authenticated System Administrator to view the Operations Dashboard.</p>
          <button className="btn-return-home" onClick={onNavigateHome}>
            Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  // Load all dashboard data
  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Fetch all orders
      const ordersRes = await orderAPI.getAllOrders().catch((e) => {
        console.warn("Could not load orders:", e.message);
        return { orders: [] };
      });
      if (ordersRes.orders) setOrders(ordersRes.orders);

      // 2. Fetch all foods (including unavailable ones)
      const foodsRes = await foodAPI.getAll({ all: true }).catch((e) => {
        console.warn("Could not load foods:", e.message);
        return { foods: [] };
      });
      if (foodsRes.foods) setFoods(foodsRes.foods);

      // 3. Fetch all registered users
      const usersRes = await authAPI.getAllUsers().catch((e) => {
        console.warn("Could not load users:", e.message);
        return { users: [] };
      });
      if (usersRes.users) setUsers(usersRes.users);

      if (isRefresh && onShowToast) {
        onShowToast("Dashboard data refreshed successfully! 🔄");
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      if (onShowToast) onShowToast("Failed to fetch fresh data: " + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Compute Statistics
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalFoodItems = foods.length;
  const totalUsersCount = users.length > 0 ? users.length : (orders.length > 0 ? new Set(orders.map(o => o.user?._id || o.user)).size : 1);

  // Status counts
  const countConfirmed = orders.filter((o) => o.status === "Confirmed").length;
  const countPreparing = orders.filter((o) => o.status === "Preparing").length;
  const countOnWay = orders.filter((o) => o.status === "On Way").length;
  const countDelivered = orders.filter((o) => o.status === "Delivered").length;
  const countCancelled = orders.filter((o) => o.status === "Cancelled").length;

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = orderStatusFilter === "All" || order.status === orderStatusFilter;
    const searchLower = orderSearchTerm.toLowerCase().trim();
    const matchesSearch =
      !searchLower ||
      (order._id && order._id.toLowerCase().includes(searchLower)) ||
      (order.user?.name && order.user.name.toLowerCase().includes(searchLower)) ||
      (order.user?.phone && order.user.phone.includes(searchLower)) ||
      (order.deliveryAddress?.city && order.deliveryAddress.city.toLowerCase().includes(searchLower));

    return matchesStatus && matchesSearch;
  });

  // Filtered Foods
  const filteredFoods = foods.filter((food) => {
    const matchesCategory = foodCategoryFilter === "All" || food.category === foodCategoryFilter;
    const searchLower = foodSearchTerm.toLowerCase().trim();
    const matchesSearch =
      !searchLower ||
      food.name.toLowerCase().includes(searchLower) ||
      food.description.toLowerCase().includes(searchLower);

    return matchesCategory && matchesSearch;
  });

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await orderAPI.updateStatus(orderId, newStatus);
      if (res.success && res.order) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        if (onShowToast) onShowToast(`Order status updated to "${newStatus}"! ✅`);
      }
    } catch (err) {
      console.error("Order status update failed:", err);
      if (onShowToast) onShowToast(err.message || "Failed to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Toggle Food Availability
  const handleToggleFoodAvailability = async (food) => {
    const newAvailability = !food.isAvailable;
    try {
      const res = await foodAPI.update(food._id, { isAvailable: newAvailability });
      if (res.success && res.food) {
        setFoods((prev) =>
          prev.map((f) => (f._id === food._id ? { ...f, isAvailable: newAvailability } : f))
        );
        if (onShowToast) {
          onShowToast(`"${food.name}" is now marked as ${newAvailability ? "In Stock" : "Out of Stock"}! 📦`);
        }
      }
    } catch (err) {
      console.error("Availability toggle error:", err);
      if (onShowToast) onShowToast("Failed to update availability: " + err.message);
    }
  };

  // Delete Food Item
  const handleDeleteFood = async (food) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${food.name}" from the menu?`
    );
    if (!confirmed) return;

    try {
      const res = await foodAPI.delete(food._id);
      if (res.success) {
        setFoods((prev) => prev.filter((f) => f._id !== food._id));
        if (onShowToast) onShowToast(`"${food.name}" deleted from menu.`);
      }
    } catch (err) {
      console.error("Food deletion error:", err);
      if (onShowToast) onShowToast("Failed to delete food item: " + err.message);
    }
  };

  // Open Food Modal (Add or Edit)
  const openAddFoodModal = () => {
    setFoodModal({
      isOpen: true,
      mode: "add",
      data: {
        name: "",
        category: "Pizza",
        price: "",
        description: "",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        isAvailable: true,
        prepTime: "20-25 min",
        rating: 4.5
      }
    });
  };

  const openEditFoodModal = (food) => {
    setFoodModal({
      isOpen: true,
      mode: "edit",
      data: {
        _id: food._id,
        name: food.name,
        category: food.category,
        price: food.price,
        description: food.description,
        image: food.image,
        isVeg: food.isVeg !== undefined ? food.isVeg : true,
        isAvailable: food.isAvailable !== undefined ? food.isAvailable : true,
        prepTime: food.prepTime || "20-25 min",
        rating: food.rating || 4.5
      }
    });
  };

  // Save Food (Submit Form)
  const handleSaveFood = async (e) => {
    e.preventDefault();
    const { _id, name, category, price, description, image, isVeg, isAvailable, prepTime, rating } = foodModal.data;

    if (!name.trim() || !description.trim() || !image.trim() || price === "") {
      if (onShowToast) onShowToast("Please fill in all required fields.");
      return;
    }

    setSavingFood(true);

    try {
      const payload = {
        name: name.trim(),
        category,
        price: Number(price),
        description: description.trim(),
        image: image.trim(),
        isVeg: Boolean(isVeg),
        isAvailable: Boolean(isAvailable),
        prepTime: prepTime.trim() || "20-25 min",
        rating: Number(rating) || 4.5
      };

      if (foodModal.mode === "add") {
        const res = await foodAPI.create(payload);
        if (res.success && res.food) {
          setFoods((prev) => [res.food, ...prev]);
          if (onShowToast) onShowToast(`Dish "${res.food.name}" added to menu successfully! 🎉`);
          setFoodModal({ ...foodModal, isOpen: false });
        }
      } else {
        const res = await foodAPI.update(_id, payload);
        if (res.success && res.food) {
          setFoods((prev) => prev.map((f) => (f._id === _id ? res.food : f)));
          if (onShowToast) onShowToast(`Dish "${res.food.name}" updated successfully! ✏️`);
          setFoodModal({ ...foodModal, isOpen: false });
        }
      }
    } catch (err) {
      console.error("Save food error:", err);
      if (onShowToast) onShowToast("Failed to save dish: " + err.message);
    } finally {
      setSavingFood(false);
    }
  };

  return (
    <div className="admin-dashboard-wrapper">
      {/* Top Banner Header */}
      <div className="admin-topbar">
        <div className="admin-topbar-left">
          <div className="admin-shield-icon">🛡️</div>
          <div>
            <h1 className="admin-page-title">Admin Operations Center</h1>
            <p className="admin-page-subtitle">
              Live orders tracking, food catalog CRUD, and platform analytics
            </p>
          </div>
        </div>

        <div className="admin-topbar-right">
          <div className="admin-user-pill">
            <span className="admin-badge-indicator">● LIVE ADMIN</span>
            <span className="admin-name-display">{user.name}</span>
          </div>

          <button
            className="admin-btn-action secondary"
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            title="Refresh database records"
          >
            {refreshing ? "Refreshing..." : "🔄 Refresh"}
          </button>

          <button
            className="admin-btn-action primary"
            onClick={onNavigateHome}
            title="View customer storefront"
          >
            🏪 View Store
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="admin-tabs-bar">
        <button
          className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <span className="tab-icon">📊</span> Overview & Metrics
        </button>

        <button
          className={`admin-tab-btn ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          <span className="tab-icon">📦</span> Manage Orders
          <span className="tab-badge">{totalOrders}</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === "foods" ? "active" : ""}`}
          onClick={() => setActiveTab("foods")}
        >
          <span className="tab-icon">🍕</span> Food Catalog
          <span className="tab-badge">{totalFoodItems}</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <span className="tab-icon">👥</span> Registered Users
          <span className="tab-badge">{totalUsersCount}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="admin-content-container">
        {loading ? (
          <div className="admin-loading-view">
            <div className="admin-spinner"></div>
            <p>Fetching real-time platform data from MongoDB Atlas...</p>
          </div>
        ) : (
          <>
            {/* ==================== 1. OVERVIEW TAB ==================== */}
            {activeTab === "overview" && (
              <div className="admin-tab-pane">
                {/* 4 Metric Cards */}
                <div className="admin-metrics-grid">
                  <div className="metric-card total-orders">
                    <div className="metric-icon-box">📦</div>
                    <div className="metric-info">
                      <span className="metric-label">Total Orders</span>
                      <h3 className="metric-value">{totalOrders}</h3>
                      <span className="metric-foot">{countDelivered} successfully delivered</span>
                    </div>
                  </div>

                  <div className="metric-card gross-revenue">
                    <div className="metric-icon-box">💰</div>
                    <div className="metric-info">
                      <span className="metric-label">Total Revenue</span>
                      <h3 className="metric-value">₹{totalRevenue.toLocaleString("en-IN")}</h3>
                      <span className="metric-foot">From all active orders</span>
                    </div>
                  </div>

                  <div className="metric-card food-items">
                    <div className="metric-icon-box">🍽️</div>
                    <div className="metric-info">
                      <span className="metric-label">Food Menu Items</span>
                      <h3 className="metric-value">{totalFoodItems}</h3>
                      <span className="metric-foot">
                        {foods.filter((f) => f.isAvailable).length} currently in stock
                      </span>
                    </div>
                  </div>

                  <div className="metric-card platform-users">
                    <div className="metric-icon-box">👥</div>
                    <div className="metric-info">
                      <span className="metric-label">Total Users</span>
                      <h3 className="metric-value">{totalUsersCount}</h3>
                      <span className="metric-foot">Customers & Staff</span>
                    </div>
                  </div>
                </div>

                {/* Orders Fulfillment Status Pipeline */}
                <div className="admin-section-box">
                  <h3 className="admin-box-title">Order Fulfillment Status Pipeline</h3>
                  <div className="pipeline-cards-row">
                    <div className="pipeline-card confirmed">
                      <span className="pipeline-emoji">📝</span>
                      <span className="pipeline-count">{countConfirmed}</span>
                      <span className="pipeline-status">Confirmed</span>
                    </div>
                    <div className="pipeline-card preparing">
                      <span className="pipeline-emoji">🍳</span>
                      <span className="pipeline-count">{countPreparing}</span>
                      <span className="pipeline-status">Cooking</span>
                    </div>
                    <div className="pipeline-card onway">
                      <span className="pipeline-emoji">🛵</span>
                      <span className="pipeline-count">{countOnWay}</span>
                      <span className="pipeline-status">On The Way</span>
                    </div>
                    <div className="pipeline-card delivered">
                      <span className="pipeline-emoji">✅</span>
                      <span className="pipeline-count">{countDelivered}</span>
                      <span className="pipeline-status">Delivered</span>
                    </div>
                    <div className="pipeline-card cancelled">
                      <span className="pipeline-emoji">❌</span>
                      <span className="pipeline-count">{countCancelled}</span>
                      <span className="pipeline-status">Cancelled</span>
                    </div>
                  </div>
                </div>

                {/* Recent Orders Overview */}
                <div className="admin-section-box">
                  <div className="box-header-row">
                    <h3 className="admin-box-title">Latest Customer Orders</h3>
                    <button
                      className="btn-link-action"
                      onClick={() => setActiveTab("orders")}
                    >
                      View All Orders →
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <p className="admin-empty-text">No orders placed yet.</p>
                  ) : (
                    <div className="admin-table-responsive">
                      <table className="admin-data-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Amount</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 5).map((order) => (
                            <tr key={order._id}>
                              <td className="font-mono">
                                #ORD-{order._id.slice(-6).toUpperCase()}
                              </td>
                              <td>
                                <strong>{order.user?.name || "Customer"}</strong>
                                <br />
                                <small className="text-muted">{order.user?.phone || "No phone"}</small>
                              </td>
                              <td>
                                {order.items?.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                              </td>
                              <td className="font-bold">₹{order.totalAmount}</td>
                              <td>{new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                              <td>
                                <span className={`status-pill ${(order.status || "confirmed").toLowerCase().replace(/\s+/g, "-")}`}>
                                  ● {order.status}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="btn-table-action"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================== 2. ORDERS MANAGEMENT TAB ==================== */}
            {activeTab === "orders" && (
              <div className="admin-tab-pane">
                {/* Order Filter Bar */}
                <div className="admin-filters-bar">
                  <div className="filter-search-box">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Search by Order ID, customer name, phone, city..."
                      value={orderSearchTerm}
                      onChange={(e) => setOrderSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="filter-select-group">
                    <label>Status Filter:</label>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                    >
                      <option value="All">All Statuses ({orders.length})</option>
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st} ({orders.filter((o) => o.status === st).length})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Orders List Table */}
                <div className="admin-section-box no-margin">
                  <div className="admin-table-responsive">
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer Info</th>
                          <th>Address</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Update Status</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="empty-table-row">
                              No orders match your filter criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((order) => (
                            <tr key={order._id}>
                              <td className="font-mono">
                                #ORD-{order._id.slice(-6).toUpperCase()}
                                <br />
                                <small className="text-muted">
                                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </small>
                              </td>
                              <td>
                                <strong>{order.user?.name || "Customer"}</strong>
                                <br />
                                <small>{order.user?.email}</small>
                                <br />
                                <small className="text-muted">📞 {order.user?.phone || order.deliveryAddress?.phone || "N/A"}</small>
                              </td>
                              <td className="delivery-address-cell">
                                <span>{order.deliveryAddress?.street}</span>
                                <br />
                                <small className="text-muted">
                                  {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}
                                </small>
                              </td>
                              <td className="items-summary-cell">
                                {order.items?.map((item, idx) => (
                                  <div key={idx} className="order-item-inline">
                                    <span className="qty-tag">{item.quantity}x</span> {item.name}
                                  </div>
                                ))}
                              </td>
                              <td className="font-bold price-highlight">
                                ₹{order.totalAmount}
                                <br />
                                <small className="badge-cod">{order.paymentMethod || "COD"}</small>
                              </td>
                              <td>
                                <span className={`status-pill ${(order.status || "confirmed").toLowerCase().replace(/\s+/g, "-")}`}>
                                  ● {order.status}
                                </span>
                              </td>
                              <td>
                                <select
                                  className="admin-status-dropdown"
                                  value={order.status}
                                  onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                  disabled={updatingOrderId === order._id}
                                >
                                  {ORDER_STATUSES.map((st) => (
                                    <option key={st} value={st}>
                                      {st}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <button
                                  className="btn-table-action"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== 3. FOOD CATALOG MANAGEMENT TAB ==================== */}
            {activeTab === "foods" && (
              <div className="admin-tab-pane">
                {/* Food Controls Bar */}
                <div className="admin-filters-bar">
                  <div className="filter-search-box">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Search food item by name or ingredients..."
                      value={foodSearchTerm}
                      onChange={(e) => setFoodSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="filter-select-group">
                    <label>Category:</label>
                    <select
                      value={foodCategoryFilter}
                      onChange={(e) => setFoodCategoryFilter(e.target.value)}
                    >
                      <option value="All">All Categories</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button className="admin-btn-primary add-food-btn" onClick={openAddFoodModal}>
                    <span>+ Add New Dish</span>
                  </button>
                </div>

                {/* Food Catalog Table / Grid */}
                <div className="admin-section-box no-margin">
                  <div className="admin-table-responsive">
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Diet</th>
                          <th>Availability</th>
                          <th>Prep Time</th>
                          <th>Rating</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFoods.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="empty-table-row">
                              No food items found matching your filters.
                            </td>
                          </tr>
                        ) : (
                          filteredFoods.map((food) => (
                            <tr key={food._id}>
                              <td className="food-table-item-cell">
                                <img
                                  src={food.image}
                                  alt={food.name}
                                  className="food-thumb-admin"
                                />
                                <div>
                                  <strong>{food.name}</strong>
                                  <p className="food-desc-admin">{food.description}</p>
                                </div>
                              </td>
                              <td>
                                <span className="category-pill-admin">{food.category}</span>
                              </td>
                              <td className="font-bold price-highlight">₹{food.price}</td>
                              <td>
                                <span className={`diet-pill ${food.isVeg ? "veg" : "nonveg"}`}>
                                  {food.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}
                                </span>
                              </td>
                              <td>
                                <button
                                  className={`availability-toggle-btn ${food.isAvailable ? "available" : "out-of-stock"}`}
                                  onClick={() => handleToggleFoodAvailability(food)}
                                  title="Click to toggle availability"
                                >
                                  {food.isAvailable ? "✓ In Stock" : "✗ Out of Stock"}
                                </button>
                              </td>
                              <td>{food.prepTime || "20-25 min"}</td>
                              <td>⭐ {food.rating || 4.5}</td>
                              <td className="action-buttons-cell">
                                <button
                                  className="btn-action-icon edit"
                                  onClick={() => openEditFoodModal(food)}
                                  title="Edit Dish"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  className="btn-action-icon delete"
                                  onClick={() => handleDeleteFood(food)}
                                  title="Delete Dish"
                                >
                                  🗑️ Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== 4. USERS MANAGEMENT TAB ==================== */}
            {activeTab === "users" && (
              <div className="admin-tab-pane">
                <div className="admin-section-box no-margin">
                  <div className="box-header-row">
                    <h3 className="admin-box-title">Registered System Users</h3>
                    <span className="total-users-badge">
                      Total Accounts: {totalUsersCount}
                    </span>
                  </div>

                  <div className="admin-table-responsive">
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th>User ID</th>
                          <th>Full Name</th>
                          <th>Email Address</th>
                          <th>Phone</th>
                          <th>Assigned Role</th>
                          <th>Registered On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="empty-table-row">
                              No user records retrieved.
                            </td>
                          </tr>
                        ) : (
                          users.map((u) => (
                            <tr key={u._id}>
                              <td className="font-mono text-muted">{u._id}</td>
                              <td>
                                <strong>{u.name}</strong>
                              </td>
                              <td>{u.email}</td>
                              <td>{u.phone || "—"}</td>
                              <td>
                                <span className={`user-role-badge ${u.role}`}>
                                  {u.role === "admin" ? "🛡️ Admin" : "👤 Customer"}
                                </span>
                              </td>
                              <td>
                                {u.createdAt
                                  ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric"
                                    })
                                  : "—"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ==================== MODAL: ADD / EDIT FOOD ==================== */}
      {foodModal.isOpen && (
        <div className="admin-modal-overlay" onClick={() => setFoodModal({ ...foodModal, isOpen: false })}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{foodModal.mode === "add" ? "🍽️ Add New Food Dish" : "✏️ Edit Food Details"}</h3>
              <button
                className="admin-modal-close"
                onClick={() => setFoodModal({ ...foodModal, isOpen: false })}
              >
                ✕
              </button>
            </div>

            <form className="admin-modal-form" onSubmit={handleSaveFood}>
              <div className="form-group-row">
                <div className="form-field-group">
                  <label>Dish Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paneer Butter Masala"
                    value={foodModal.data.name}
                    onChange={(e) =>
                      setFoodModal({
                        ...foodModal,
                        data: { ...foodModal.data, name: e.target.value }
                      })
                    }
                  />
                </div>

                <div className="form-field-group">
                  <label>Category *</label>
                  <select
                    value={foodModal.data.category}
                    onChange={(e) =>
                      setFoodModal({
                        ...foodModal,
                        data: { ...foodModal.data, category: e.target.value }
                      })
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-field-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    placeholder="e.g. 349"
                    value={foodModal.data.price}
                    onChange={(e) =>
                      setFoodModal({
                        ...foodModal,
                        data: { ...foodModal.data, price: e.target.value }
                      })
                    }
                  />
                </div>

                <div className="form-field-group">
                  <label>Prep Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 20-25 min"
                    value={foodModal.data.prepTime}
                    onChange={(e) =>
                      setFoodModal({
                        ...foodModal,
                        data: { ...foodModal.data, prepTime: e.target.value }
                      })
                    }
                  />
                </div>

                <div className="form-field-group">
                  <label>Rating (1.0 - 5.0)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={foodModal.data.rating}
                    onChange={(e) =>
                      setFoodModal({
                        ...foodModal,
                        data: { ...foodModal.data, rating: e.target.value }
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label>Description *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe the dish ingredients, preparation, taste..."
                  value={foodModal.data.description}
                  onChange={(e) =>
                    setFoodModal({
                      ...foodModal,
                      data: { ...foodModal.data, description: e.target.value }
                    })
                  }
                ></textarea>
              </div>

              <div className="form-field-group">
                <label>Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={foodModal.data.image}
                  onChange={(e) =>
                    setFoodModal({
                      ...foodModal,
                      data: { ...foodModal.data, image: e.target.value }
                    })
                  }
                />
              </div>

              {foodModal.data.image && (
                <div className="image-preview-box">
                  <span>Image Preview:</span>
                  <img
                    src={foodModal.data.image}
                    alt="Preview"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="form-toggles-row">
                <label className="toggle-control">
                  <input
                    type="checkbox"
                    checked={foodModal.data.isVeg}
                    onChange={(e) =>
                      setFoodModal({
                        ...foodModal,
                        data: { ...foodModal.data, isVeg: e.target.checked }
                      })
                    }
                  />
                  <span>🌱 Vegetarian Dish</span>
                </label>

                <label className="toggle-control">
                  <input
                    type="checkbox"
                    checked={foodModal.data.isAvailable}
                    onChange={(e) =>
                      setFoodModal({
                        ...foodModal,
                        data: { ...foodModal.data, isAvailable: e.target.checked }
                      })
                    }
                  />
                  <span>📦 Available In Stock</span>
                </label>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setFoodModal({ ...foodModal, isOpen: false })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-save-submit"
                  disabled={savingFood}
                >
                  {savingFood ? "Saving Dish..." : foodModal.mode === "add" ? "Add to Menu" : "Update Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ORDER DETAILS ==================== */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-card order-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>📦 Order Details</h3>
                <span className="font-mono text-muted">
                  #ORD-{selectedOrder._id.slice(-6).toUpperCase()}
                </span>
              </div>
              <button
                className="admin-modal-close"
                onClick={() => setSelectedOrder(null)}
              >
                ✕
              </button>
            </div>

            <div className="order-details-body">
              <div className="order-details-grid">
                <div className="detail-block">
                  <h4>Customer Information</h4>
                  <p><strong>Name:</strong> {selectedOrder.user?.name || "Customer"}</p>
                  <p><strong>Email:</strong> {selectedOrder.user?.email || "N/A"}</p>
                  <p><strong>Phone:</strong> {selectedOrder.user?.phone || selectedOrder.deliveryAddress?.phone || "N/A"}</p>
                </div>

                <div className="detail-block">
                  <h4>Delivery Address</h4>
                  <p>{selectedOrder.deliveryAddress?.street}</p>
                  <p>{selectedOrder.deliveryAddress?.city} - {selectedOrder.deliveryAddress?.pincode}</p>
                  <p><strong>Phone:</strong> {selectedOrder.deliveryAddress?.phone}</p>
                </div>
              </div>

              <div className="order-items-table-wrapper">
                <h4>Items Ordered</h4>
                <table className="items-table-modal">
                  <thead>
                    <tr>
                      <th>Dish</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.price}</td>
                        <td>₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="text-right">Grand Total:</td>
                      <td className="font-bold price-highlight">₹{selectedOrder.totalAmount}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="order-status-changer-box">
                <label>Change Order Status:</label>
                <div className="status-selector-row">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder._id, e.target.value)}
                    disabled={updatingOrderId === selectedOrder._id}
                  >
                    {ORDER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <span className={`status-pill ${(selectedOrder.status || "confirmed").toLowerCase().replace(/\s+/g, "-")}`}>
                    Current: {selectedOrder.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
