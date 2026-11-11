import React from "react";
import "./Footer.css";

const Footer = ({ onNavigateHome, onNavigateMenu, onOpenOrders }) => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        {/* Top Footer Columns */}
        <div className="footer-grid">
          {/* Column 1: Brand Info */}
          <div className="footer-col brand-col">
            <div className="footer-brand" onClick={onNavigateHome}>
              <div className="brand-logo-icon">
                <span>🍕</span>
              </div>
              <div className="brand-text">
                <span className="brand-title">Foodie</span>
                <span className="brand-dot">.</span>
              </div>
            </div>
            <p className="footer-about">
              Delivering happiness, one bite at a time. The quickest and most reliable
              food delivery platform made specially for campus & city cravings.
            </p>
            <div className="footer-socials">
              <span className="social-icon">📷</span>
              <span className="social-icon">📘</span>
              <span className="social-icon">🐦</span>
              <span className="social-icon">💼</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links">
              <li><button onClick={onNavigateHome}>Home</button></li>
              <li><button onClick={onNavigateMenu}>Food Menu</button></li>
              <li><button onClick={onOpenOrders}>Order History</button></li>
              <li><a href="#categories">Food Categories</a></li>
            </ul>
          </div>

          {/* Column 3: Popular Cuisines */}
          <div className="footer-col">
            <h4 className="footer-col-title">Popular Cuisines</h4>
            <ul className="footer-links">
              <li><span>Hyderabadi Biryani</span></li>
              <li><span>Woodfired Margherita</span></li>
              <li><span>Crispy Smash Burgers</span></li>
              <li><span>Szechuan Chinese</span></li>
              <li><span>Belgian Choco Lava</span></li>
            </ul>
          </div>

          {/* Column 4: Contact & Hours */}
          <div className="footer-col contact-col">
            <h4 className="footer-col-title">Get in Touch</h4>
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <span>Campus Avenue, Tech Hub Block 4, New Delhi - 110001</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <span>+91 98765 43210</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">✉️</span>
              <span>support@foodieorders.com</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">⏰</span>
              <span>Open Daily: 9:00 AM – 11:30 PM</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© 2026 Foodie Delivery Inc. All rights reserved. Full Stack College Project.</p>
          <div className="footer-legal">
            <a href="#privacy">Privacy Policy</a>
            <span className="dot">•</span>
            <a href="#terms">Terms of Service</a>
            <span className="dot">•</span>
            <a href="#cookies">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
