import React, { useState, useEffect } from "react";
import "./App.css";
import FeatureCard from "./components/FeatureCard";
import Header from "./components/Header";

function App() {
    const [buttonText, setButtonText] = useState("Get Started");
    const [buttonStyle, setButtonStyle] = useState("default");

    const handleGetStarted = () => {
        setButtonText("Welcome to React + Electron! 🎉");
        setButtonStyle("success");

        setTimeout(() => {
            setButtonText("Get Started");
            setButtonStyle("default");
        }, 2000);
    };

    const features = [
        {
            icon: "⏱️",
            text: "Time Tracking",
            description: "Track your time efficiently",
        },
        { icon: "📊", text: "Analytics", description: "View detailed reports" },
        {
            icon: "🎯",
            text: "Productivity",
            description: "Boost your productivity",
        },
        { icon: "⚡", text: "Fast", description: "Lightning fast performance" },
    ];

    useEffect(() => {
        console.log("Desktop Tracker React App loaded successfully!");
    }, []);

    return (
        <div className="App">
            <div className="container">
                <div className="content">
                    <Header />

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                icon={feature.icon}
                                text={feature.text}
                                description={feature.description}
                            />
                        ))}
                    </div>

                    <button
                        className={`cta-button ${buttonStyle}`}
                        onClick={handleGetStarted}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;
