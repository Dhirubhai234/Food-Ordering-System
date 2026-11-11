import React, { useState } from "react";
import FoodCard from "./FoodCard";
import "./FoodList.css";

const FoodList = ({
  foods,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  selectedCategory,
  searchTerm,
  onResetFilters
}) => {
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState("popular"); // popular, priceLow, priceHigh, rating

  // Handle comprehensive reset
  const handleFullReset = () => {
    setVegOnly(false);
    setSortBy("popular");
    if (onResetFilters) onResetFilters();
  };

  // Filter foods by Category and Search Term and Veg Only
  const filteredFoods = foods.filter((food) => {
    const matchesCategory =
      selectedCategory === "All" || food.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVeg = !vegOnly || food.isVeg;

    return matchesCategory && matchesSearch && matchesVeg;
  });

  // Sort foods
  const sortedFoods = [...filteredFoods].sort((a, b) => {
    if (sortBy === "priceLow") return a.price - b.price;
    if (sortBy === "priceHigh") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return b.reviews - a.reviews; // popular
  });

  return (
    <section className="food-list-section" id="menu">
      <div className="food-list-container">
        {/* Section Heading & Filter Controls */}
        <div className="menu-header-bar">
          <div>
            <span className="section-tag">POPULAR DISHES</span>
            <h2 className="section-title">
              {selectedCategory === "All" ? "Most Popular Near You" : `${selectedCategory} Specials`}
            </h2>
            <p className="menu-subtext">
              Showing {sortedFoods.length} fresh & delicious items
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>

          <div className="menu-controls">
            {/* Veg Toggle Switch */}
            <label className="veg-toggle-label">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
              />
              <span className="veg-toggle-switch"></span>
              <span className="veg-toggle-text">Veg Only</span>
            </label>

            {/* Sort Select */}
            <div className="sort-wrapper">
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Food Grid */}
        {sortedFoods.length > 0 ? (
          <div className="food-grid">
            {sortedFoods.map((food) => {
              const foodId = food._id || food.id;
              const inCart = cartItems.find((item) => (item._id || item.id) === foodId);
              return (
                <FoodCard
                  key={foodId}
                  food={food}
                  cartItem={inCart}
                  onAddToCart={onAddToCart}
                  onUpdateQuantity={onUpdateQuantity}
                />
              );
            })}
          </div>
        ) : (
          <div className="empty-results-box">
            <div className="empty-results-icon">🔍</div>
            <h3>No delicious items found</h3>
            <p>
              We couldn't find anything matching your current filters or search query.
            </p>
            <button className="btn-reset-filters" onClick={handleFullReset}>
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FoodList;
