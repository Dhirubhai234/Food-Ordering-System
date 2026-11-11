import React from "react";
import "./OrdersModal.css";

const OrdersModal = ({
  isOpen,
  onClose,
  orders,
  onExploreMenu,
  user,
  onOpenAuth,
  loading
}) => {
  if (!isOpen) return null;

  // Helper to determine stepper progress based on status
  const getStepStatus = (orderStatus, stepName) => {
    const status = (orderStatus || "Confirmed").toLowerCase();
    if (status === "delivered") {
      return { isDone: true, isActive: false };
    }
    if (status === "on way" || status === "out for delivery") {
      if (stepName === "Confirmed" || stepName === "Cooking") return { isDone: true, isActive: false };
      if (stepName === "On Way") return { isDone: false, isActive: true };
      return { isDone: false, isActive: false };
    }
    if (status === "preparing" || status === "cooking") {
      if (stepName === "Confirmed") return { isDone: true, isActive: false };
      if (stepName === "Cooking") return { isDone: false, isActive: true };
      return { isDone: false, isActive: false };
    }
    // Confirmed
    if (stepName === "Confirmed") return { isDone: false, isActive: true };
    return { isDone: false, isActive: false };
  };

  const formatOrderId = (order) => {
    if (order.id) return order.id;
    if (order._id) return `#ORD-${order._id.slice(-6).toUpperCase()}`;
    return "#ORD-FOODIE";
  };

  const formatTimestamp = (order) => {
    if (order.timestamp) return order.timestamp;
    if (order.createdAt) {
      return new Date(order.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
    return "Just now";
  };

  return (
    <div className="orders-overlay" onClick={onClose}>
      <div className="orders-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="orders-modal-header">
          <div className="orders-title-group">
            <span className="orders-icon">📦</span>
            <div>
              <h2 className="orders-modal-title">My Orders</h2>
              <span className="orders-subtitle">
                Track active orders and review your meal history
              </span>
            </div>
          </div>
          <button className="orders-close-btn" onClick={onClose} aria-label="Close orders">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="orders-modal-body">
          {!user ? (
            <div className="orders-empty-state">
              <span className="empty-order-emoji">🔐</span>
              <h3>Please Log In</h3>
              <p>Sign in to view your real-time orders, track deliveries, and view bills.</p>
              <button
                className="btn-order-now"
                onClick={() => {
                  onClose();
                  onOpenAuth("login");
                }}
              >
                Log In to Your Account
              </button>
            </div>
          ) : loading ? (
            <div className="orders-empty-state">
              <span className="empty-order-emoji">⏳</span>
              <h3>Loading Orders...</h3>
              <p>Fetching your latest meal orders from the server.</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="orders-empty-state">
              <span className="empty-order-emoji">🍽️</span>
              <h3>No Orders Placed Yet</h3>
              <p>Explore our delicious menu and place your very first meal order!</p>
              <button
                className="btn-order-now"
                onClick={() => {
                  onClose();
                  onExploreMenu();
                }}
              >
                Order Food Now
              </button>
            </div>
          ) : (
            <div className="orders-cards-list">
              {orders.map((order) => {
                const s1 = getStepStatus(order.status, "Confirmed");
                const s2 = getStepStatus(order.status, "Cooking");
                const s3 = getStepStatus(order.status, "On Way");
                const s4 = getStepStatus(order.status, "Delivered");

                return (
                  <div key={order._id || order.id} className="order-history-card">
                    <div className="order-card-header">
                      <div>
                        <span className="order-id-badge">{formatOrderId(order)}</span>
                        <span className="order-timestamp">{formatTimestamp(order)}</span>
                      </div>
                      <span className={`status-pill ${(order.status || "confirmed").toLowerCase().replace(/\s+/g, "-")}`}>
                        ● {order.status || "Confirmed"}
                      </span>
                    </div>

                    {/* Dynamic Order Progress Stepper */}
                    <div className="order-stepper">
                      <div className={`step-point ${s1.isDone ? "completed" : s1.isActive ? "active" : ""}`}>
                        <span className="step-circle">{s1.isDone ? "✓" : "📝"}</span>
                        <span className="step-name">Confirmed</span>
                      </div>
                      <div className={`step-connector ${s2.isDone || s2.isActive ? "active" : ""}`}></div>
                      <div className={`step-point ${s2.isDone ? "completed" : s2.isActive ? "active" : ""}`}>
                        <span className="step-circle">{s2.isDone ? "✓" : "🍳"}</span>
                        <span className="step-name">Cooking</span>
                      </div>
                      <div className={`step-connector ${s3.isDone || s3.isActive ? "active" : ""}`}></div>
                      <div className={`step-point ${s3.isDone ? "completed" : s3.isActive ? "active" : ""}`}>
                        <span className="step-circle">{s3.isDone ? "✓" : "🛵"}</span>
                        <span className="step-name">On Way</span>
                      </div>
                      <div className={`step-connector ${s4.isDone ? "active" : ""}`}></div>
                      <div className={`step-point ${s4.isDone ? "completed" : s4.isActive ? "active" : ""}`}>
                        <span className="step-circle">{s4.isDone ? "✓" : "🏠"}</span>
                        <span className="step-name">Delivered</span>
                      </div>
                    </div>

                    {/* Items summary */}
                    <div className="order-items-summary">
                      {order.items &&
                        order.items.map((item, idx) => (
                          <div key={idx} className="ordered-item-line">
                            <span className="item-qty-name">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="item-line-price">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                    </div>

                    <div className="order-card-footer">
                      <span className="order-total-label">Total Amount:</span>
                      <span className="order-total-amount">₹{order.totalAmount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersModal;
