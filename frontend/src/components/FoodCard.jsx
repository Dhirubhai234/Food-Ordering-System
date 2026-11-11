import React from "react";
import "./FoodCard.css";

const FoodCard = ({ food, cartItem, onAddToCart, onUpdateQuantity }) => {
  const foodId = food._id || food.id;

  return (
    <div className="food-card">
      {/* Food Image Container */}
      <div className="food-card-media">
        <img
          src={food.image}
          alt={food.name}
          className="food-card-img"
          loading="lazy"
        />

        {/* Veg / Non-Veg Tag */}
        <div className={`diet-badge ${food.isVeg ? "veg" : "non-veg"}`}>
          <span className="diet-dot"></span>
        </div>

        {/* Category Pill */}
        <span className="food-category-tag">{food.category}</span>
      </div>

      {/* Food Content Details */}
      <div className="food-card-body">
        <div className="food-card-header">
          <h3 className="food-name" title={food.name}>
            {food.name}
          </h3>
          <div className="food-rating-pill">
            <span className="star-icon">★</span>
            <span className="rating-value">{food.rating}</span>
          </div>
        </div>

        <p className="food-description">{food.description}</p>

        <div className="food-meta">
          <span className="prep-time">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {food.prepTime}
          </span>
          <span className="reviews-count">({food.reviews}+ orders)</span>
        </div>

        {/* Footer with Price and Add to Cart */}
        <div className="food-card-footer">
          <div className="price-tag">
            <span className="currency-symbol">₹</span>
            <span className="price-amount">{food.price}</span>
          </div>

          {cartItem ? (
            <div className="cart-qty-counter">
              <button
                className="qty-btn dec"
                onClick={() => onUpdateQuantity(foodId, -1)}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="qty-number">{cartItem.quantity}</span>
              <button
                className="qty-btn inc"
                onClick={() => onUpdateQuantity(foodId, 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          ) : (
            <button
              className="btn-add-cart"
              onClick={() => onAddToCart(food)}
            >
              <span className="add-text">Add to Cart</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
