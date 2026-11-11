import React from "react";
import "./Hero.css";

const Hero = ({ searchTerm, onSearchChange, onExploreMenu }) => {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    onExploreMenu();
  };

  return (
    <section className="hero-section">
      <div className="hero-container">
        {/* Left Content Column */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-flame">🔥</span>
            <span>Fastest Delivery in 30 Mins</span>
          </div>

          <h1 className="hero-title">
            Delicious Food, <br />
            <span className="hero-highlight">Delivered Fresh</span> to Your Door.
          </h1>

          <p className="hero-subtitle">
            Order your favourite meals from the best restaurants in town.
            Hot, hygienic, and cooked with love.
          </p>

          {/* Search Bar Form */}
          <form className="hero-search-form" onSubmit={handleFormSubmit}>
            <div className="search-input-wrapper">
              <svg
                className="search-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search Biryani, Pizza, Burger, Desserts..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => onSearchChange("")}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <button type="submit" className="hero-submit-btn">
              Search Food
            </button>
          </form>

          {/* Action CTAs & Highlights */}
          <div className="hero-actions">
            <button className="btn-explore-menu" onClick={onExploreMenu}>
              Explore Menu
              <svg
                width="18"
                height="18"
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
            <div className="hero-popular-tags">
              <span className="tags-label">Popular:</span>
              <button
                type="button"
                onClick={() => {
                  onSearchChange("Biryani");
                  onExploreMenu();
                }}
              >
                Biryani
              </button>
              <button
                type="button"
                onClick={() => {
                  onSearchChange("Pizza");
                  onExploreMenu();
                }}
              >
                Pizza
              </button>
              <button
                type="button"
                onClick={() => {
                  onSearchChange("Burger");
                  onExploreMenu();
                }}
              >
                Burger
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="hero-stats">
            <div className="stat-card">
              <span className="stat-number">500+</span>
              <span className="stat-label">Restaurants</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-card">
              <span className="stat-number">30 Min</span>
              <span className="stat-label">Fast Delivery</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-card">
              <span className="stat-number">4.9 ★</span>
              <span className="stat-label">Customer Rating</span>
            </div>
          </div>
        </div>

        {/* Right Visual Image Column */}
        <div className="hero-image-wrapper">
          <div className="hero-image-backdrop"></div>
          <div className="hero-image-container">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80"
              alt="Delightful Food Dishes spread"
              className="hero-main-img"
            />
          </div>

          {/* Floating Floating Badges */}
          <div className="floating-card floating-card-top">
            <div className="floating-icon">⚡</div>
            <div className="floating-info">
              <span className="floating-title">Super Fast</span>
              <span className="floating-desc">Average delivery 28m</span>
            </div>
          </div>

          <div className="floating-card floating-card-bottom">
            <div className="floating-icon">⭐</div>
            <div className="floating-info">
              <span className="floating-title">4.9 / 5.0</span>
              <span className="floating-desc">Over 15,000+ Reviews</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
