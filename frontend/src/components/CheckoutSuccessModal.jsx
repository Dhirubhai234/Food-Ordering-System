import React from "react";
import "./CheckoutSuccessModal.css";

const CheckoutSuccessModal = ({ isOpen, onClose, orderDetails, onTrackOrder }) => {
  if (!isOpen || !orderDetails) return null;

  return (
    <div className="checkout-success-overlay" onClick={onClose}>
      <div className="checkout-success-card" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon-badge">
          <span>🎉</span>
        </div>

        <h2 className="success-title">Order Placed Successfully!</h2>
        <p className="success-subtitle">
          Your kitchen order has been sent to the restaurant and is being prepared fresh.
        </p>

        <div className="success-details-card">
          <div className="success-detail-row">
            <span>Order ID:</span>
            <strong>{orderDetails.id}</strong>
          </div>
          <div className="success-detail-row">
            <span>Total Paid:</span>
            <strong className="success-price">₹{orderDetails.totalAmount}</strong>
          </div>
          <div className="success-detail-row">
            <span>Estimated Delivery:</span>
            <strong className="delivery-time">25 - 30 Mins 🛵</strong>
          </div>
          <div className="success-detail-row">
            <span>Payment Mode:</span>
            <strong>Cash / UPI on Delivery</strong>
          </div>
        </div>

        <div className="success-action-buttons">
          <button
            className="btn-track-order"
            onClick={() => {
              onClose();
              onTrackOrder();
            }}
          >
            Track in My Orders
          </button>
          <button className="btn-continue-shopping" onClick={onClose}>
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessModal;
