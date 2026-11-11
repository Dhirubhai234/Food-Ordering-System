import React from "react";
import "./CategoryFilter.css";
import { CATEGORIES } from "../data/foodData";

const CategoryFilter = ({ selectedCategory, onSelectCategory }) => {
  return (
    <section className="category-section" id="categories">
      <div className="category-container">
        <div className="section-header">
          <span className="section-tag">EXPLORE MENU</span>
          <h2 className="section-title">Inspiration for Your Order</h2>
          <p className="section-desc">
            Browse through our handpicked culinary categories crafted by top chefs.
          </p>
        </div>

        <div className="category-list">
          {CATEGORIES.map((cat) => {
            const isSelected =
              selectedCategory === cat.name ||
              (cat.id === "all" && selectedCategory === "All");

            return (
              <button
                key={cat.id}
                className={`category-item-btn ${isSelected ? "active" : ""}`}
                onClick={() => onSelectCategory(cat.id === "all" ? "All" : cat.name)}
              >
                <div className="category-icon-box">
                  <span className="category-emoji">{cat.icon}</span>
                </div>
                <span className="category-name">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryFilter;
