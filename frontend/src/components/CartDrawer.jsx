import React, { useState } from "react";
import "./CartDrawer.css";

const CartDrawer = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckoutSuccess,
  appliedPromo,
  onApplyPromo,
  onExploreMenu,
  user,
  isPlacingOrder
}) => {
  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState({
    street: "Campus Hostel Block 4, Room 302",
    city: "New Delhi",
    pincode: "110001",
    phone: user?.phone || "9876543210"
  });

  if (!isOpen) return null;

  // Price calculations
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 40;
  const gstTax = Math.round(subtotal * 0.05); // 5% GST

  let discount = 0;
  if (appliedPromo === "FOODIE50") {
    discount = Math.min(Math.round(subtotal * 0.5), 150);
  } else if (appliedPromo === "FREEDEL") {
    discount = deliveryFee;
  } else if (appliedPromo === "BIRYANIWEEK") {
    discount = 100;
  }

  const grandTotal = Math.max(0, subtotal + deliveryFee + gstTax - discount);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (code === "FOODIE50" || code === "FREEDEL" || code === "BIRYANIWEEK") {
      onApplyPromo(code);
      setPromoMessage({ type: "success", text: `Code ${code} applied successfully!` });
    } else {
      setPromoMessage({ type: "error", text: "Invalid promo code. Try FOODIE50" });
    }
  };

  const handleProceedClick = () => {
    if (!showAddressForm) {
      setShowAddressForm(true);
      return;
    }
    // Submit order with address
    onCheckoutSuccess(grandTotal, cartItems, address);
  };

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <div className="cart-title-group">
            <h2 className="cart-title">Your Food Cart</h2>
            <span className="cart-items-counter">
              ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} items)
            </span>
          </div>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close cart">
            ✕
          </button>
        </div>

        {/* Drawer Content */}
        <div className="cart-drawer-content">
          {cartItems.length === 0 ? (
            <div className="cart-empty-view">
              <div className="cart-empty-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added any delicious food yet.</p>
              <button
                className="btn-browse-food"
                onClick={() => {
                  onClose();
                  if (onExploreMenu) onExploreMenu();
                }}
              >
                Browse Food Menu
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div key={item._id || item.id} className="cart-item-row">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-thumb"
                    />

                    <div className="cart-item-details">
                      <div className="cart-item-top">
                        <h4 className="cart-item-name">{item.name}</h4>
                        <button
                          className="cart-item-remove-btn"
                          onClick={() => onRemoveItem(item._id || item.id)}
                          title="Remove item"
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="cart-item-bottom">
                        <span className="cart-item-price">
                          ₹{item.price * item.quantity}
                        </span>

                        <div className="cart-qty-pill">
                          <button
                            onClick={() => onUpdateQuantity(item._id || item.id, -1)}
                            className="qty-pill-btn"
                          >
                            −
                          </button>
                          <span className="qty-pill-number">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item._id || item.id, 1)}
                            className="qty-pill-btn"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Address Section */}
              <div className="cart-address-box">
                <div
                  className="address-header-toggle"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                >
                  <span className="address-icon">📍</span>
                  <div className="address-summary-text">
                    <strong>Delivery Location</strong>
                    <p>{address.street}, {address.city}</p>
                  </div>
                  <span className="toggle-arrow">{showAddressForm ? "▲" : "▼"}</span>
                </div>

                {showAddressForm && (
                  <div className="address-form-fields">
                    <div className="address-field">
                      <label>Street / Hostel / Room</label>
                      <input
                        type="text"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        placeholder="House/Room No, Street"
                        required
                      />
                    </div>
                    <div className="address-row-two">
                      <div className="address-field">
                        <label>City</label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          placeholder="City"
                          required
                        />
                      </div>
                      <div className="address-field">
                        <label>Pincode</label>
                        <input
                          type="text"
                          value={address.pincode}
                          onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                          placeholder="Pincode"
                          required
                        />
                      </div>
                    </div>
                    <div className="address-field">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Promo Code Section */}
              <div className="cart-promo-section">
                <form className="promo-input-group" onSubmit={handleApplyPromo}>
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. FOODIE50)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="promo-input"
                  />
                  <button type="submit" className="btn-apply-promo">
                    Apply
                  </button>
                </form>
                {promoMessage && (
                  <span className={`promo-alert ${promoMessage.type}`}>
                    {promoMessage.text}
                  </span>
                )}
                {appliedPromo && (
                  <div className="applied-promo-chip">
                    <span>Active: <strong>{appliedPromo}</strong></span>
                    <button onClick={() => onApplyPromo(null)}>Remove</button>
                  </div>
                )}
              </div>

              {/* Bill Details */}
              <div className="cart-bill-summary">
                <h4 className="bill-heading">Bill Details</h4>

                <div className="bill-row">
                  <span>Item Total</span>
                  <span>₹{subtotal}</span>
                </div>

                <div className="bill-row">
                  <span>Delivery Partner Fee</span>
                  <span>{deliveryFee === 0 ? <strong className="free-text">FREE</strong> : `₹${deliveryFee}`}</span>
                </div>

                <div className="bill-row">
                  <span>Govt. Taxes & GST (5%)</span>
                  <span>₹{gstTax}</span>
                </div>

                {discount > 0 && (
                  <div className="bill-row discount-row">
                    <span>Discount Coupon ({appliedPromo})</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <div className="bill-row grand-total-row">
                  <span>To Pay (Server Verified)</span>
                  <span className="grand-total-val">₹{grandTotal}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="footer-amount-summary">
              <span className="footer-label">Grand Total</span>
              <span className="footer-price">₹{grandTotal}</span>
            </div>

            <button
              className="btn-checkout"
              onClick={handleProceedClick}
              disabled={isPlacingOrder}
            >
              <span>
                {isPlacingOrder
                  ? "Placing Order..."
                  : showAddressForm
                  ? "Confirm & Place Order (COD)"
                  : "Proceed to Checkout"}
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <button className="btn-clear-cart" onClick={onClearCart}>
              Clear Entire Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
