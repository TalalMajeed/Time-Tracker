import React, { useState } from "react";
import "./FeatureCard.css";

const FeatureCard = ({ icon, text, description }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`feature-card ${isHovered ? "hovered" : ""}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => {
                // Add click animation
                const card = document.querySelector(
                    `.feature-card:has(.feature-icon:contains("${icon}"))`
                );
                if (card) {
                    card.style.transform = "scale(0.95)";
                    setTimeout(() => {
                        card.style.transform = "";
                    }, 150);
                }
            }}
        >
            <div className="feature-icon">{icon}</div>
            <div className="feature-content">
                <h3 className="feature-text">{text}</h3>
                <p className="feature-description">{description}</p>
            </div>
        </div>
    );
};

export default FeatureCard;
