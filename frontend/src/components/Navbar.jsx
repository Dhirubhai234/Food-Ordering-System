import React, { useState } from "react";
import "./Navbar.css";

const Navbar = ({
  cartCount,
  onOpenCart,
  onOpenAuth,
  onOpenOrders,
  user,
  onLogout,
  onNavigateHome,
  onNavigateMenu,
  onNavigateAdmin,
  activeNav = "home"
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo */}
        <div className="navbar-brand" onClick={onNavigateHome}>
          <div className="brand-logo-icon">
            <span>🍕</span>
          </div>
          <div className="brand-text">
            <span className="brand-title">Foodie</span>
            <span className="brand-dot">.</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className={`navbar-nav ${mobileMenuOpen ? "open" : ""}`}>
          <button
            className={`nav-link ${activeNav === "home" ? "active" : ""}`}
            onClick={() => {
              onNavigateHome();
              setMobileMenuOpen(false);
            }}
          >
            Home
          </button>
          <button
            className={`nav-link ${activeNav === "menu" ? "active" : ""}`}
            onClick={() => {
              onNavigateMenu();
              setMobileMenuOpen(false);
            }}
          >
            Menu
          </button>
          <button
            className={`nav-link ${activeNav === "orders" ? "active" : ""}`}
            onClick={() => {
              onOpenOrders();
              setMobileMenuOpen(false);
            }}
          >
            My Orders
          </button>

          {/* Admin Dashboard Navigation: Only visible when logged-in user is Admin */}
          {user && user.role === "admin" && (
            <button
              className={`nav-link admin-nav-link ${activeNav === "admin" ? "active" : ""}`}
              onClick={() => {
                if (onNavigateAdmin) onNavigateAdmin();
                setMobileMenuOpen(false);
              }}
            >
              🛡️ Admin Panel
            </button>
          )}

          {/* Mobile-only auth buttons if not logged in */}
          {!user && (
            <div className="mobile-auth-row">
              <button
                className="btn-auth-login"
                onClick={() => {
                  onOpenAuth("login");
                  setMobileMenuOpen(false);
                }}
              >
                Login
              </button>
              <button
                className="btn-auth-signup"
                onClick={() => {
                  onOpenAuth("signup");
                  setMobileMenuOpen(false);
                }}
              >
                Sign Up
              </button>
            </div>
          )}
        </nav>

        {/* Action Controls */}
        <div className="navbar-actions">
          {/* Cart Trigger */}
          <button
            className="cart-btn"
            onClick={onOpenCart}
            aria-label="View Shopping Cart"
          >
            <div className="cart-icon-wrapper">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
            <span className="cart-label">Cart</span>
          </button>

          {/* User Auth Controls for Desktop */}
          {user ? (
            <div className="user-profile-menu">
              {user.role === "admin" && (
                <button
                  className="navbar-admin-badge"
                  onClick={onNavigateAdmin}
                  title="Open Admin Dashboard"
                >
                  🛡️ Admin
                </button>
              )}
              <div
                className="user-avatar-pill"
                onClick={user.role === "admin" ? onNavigateAdmin : onOpenOrders}
                title={user.role === "admin" ? "Open Admin Dashboard" : "View Orders"}
              >
                <span className="user-avatar-initial">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="user-name-text">{user.name.split(" ")[0]}</span>
              </div>
              <button
                className="btn-logout"
                onClick={onLogout}
                title="Log Out"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons-group desktop-only">
              <button
                className="btn-auth-login"
                onClick={() => onOpenAuth("login")}
              >
                Login
              </button>
              <button
                className="btn-auth-signup"
                onClick={() => onOpenAuth("signup")}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className={`bar ${mobileMenuOpen ? "active" : ""}`}></span>
            <span className={`bar ${mobileMenuOpen ? "active" : ""}`}></span>
            <span className={`bar ${mobileMenuOpen ? "active" : ""}`}></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
