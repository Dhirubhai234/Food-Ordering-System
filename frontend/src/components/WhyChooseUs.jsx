import React from "react";
import "./WhyChooseUs.css";

const FEATURES = [
  {
    icon: "🚀",
    title: "Superfast 30 Min Delivery",
    desc: "Our automated smart logistics ensure meals arrive piping hot from kitchen to your doorstep."
  },
  {
    icon: "🌱",
    title: "Fresh & 100% Hygienic",
    desc: "Rigorous temperature controls and tamper-evident packaging for peak quality and safety."
  },
  {
    icon: "👨‍🍳",
    title: "Top Rated Master Chefs",
    desc: "Every dish is curated by culinary veterans using authentic ingredients and secret spices."
  },
  {
    icon: "💬",
    title: "24/7 Live Order Support",
    desc: "Instant live updates, real-time rider tracking, and prompt customer assistance anytime."
  }
];

const WhyChooseUs = () => {
  return (
    <section className="why-section">
      <div className="why-container">
        <div className="section-header">
          <span className="section-tag">THE FOODIE PROMISE</span>
          <h2 className="section-title">Why Thousands Choose Foodie</h2>
          <p className="section-desc">
            We don't just deliver food; we deliver an unforgettable dining experience right at your table.
          </p>
        </div>

        <div className="why-grid">
          {FEATURES.map((item, index) => (
            <div key={index} className="why-card">
              <div className="why-icon-bubble">
                <span className="why-emoji">{item.icon}</span>
              </div>
              <h3 className="why-card-title">{item.title}</h3>
              <p className="why-card-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
