import React, { useState } from "react";
import "./SpecialOffers.css";
import { SPECIAL_OFFERS } from "../data/foodData";

const SpecialOffers = ({ onApplyOffer }) => {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    if (onApplyOffer) onApplyOffer(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  return (
    <section className="offers-section">
      <div className="offers-container">
        <div className="section-header">
          <span className="section-tag">EXCLUSIVE DEALS</span>
          <h2 className="section-title">Special Offers Just for You</h2>
          <p className="section-desc">
            Save big on your next meal with exclusive student discounts & promo codes.
          </p>
        </div>

        <div className="offers-grid">
          {SPECIAL_OFFERS.map((offer) => (
            <div
              key={offer.id}
              className="offer-card"
              style={{ background: offer.bgGradient }}
            >
              <div className="offer-content">
                <span className="offer-tag">{offer.tag}</span>
                <h3 className="offer-title">{offer.title}</h3>
                <p className="offer-desc">{offer.description}</p>

                <div className="coupon-box">
                  <span className="coupon-code">{offer.code}</span>
                  <button
                    className={`btn-copy-code ${copiedCode === offer.code ? "copied" : ""}`}
                    onClick={() => handleCopy(offer.code)}
                  >
                    {copiedCode === offer.code ? "Copied! ✓" : "Copy Code"}
                  </button>
                </div>
              </div>
              <div className="offer-sparkle">🏷️</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;
