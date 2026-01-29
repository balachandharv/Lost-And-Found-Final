import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ActiveUsersWidget = () => {
    const [activeCount, setActiveCount] = useState(42);

    useEffect(() => {
        // Simulate fluctuating user count
        const interval = setInterval(() => {
            const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
            setActiveCount(prev => Math.max(1, prev + change));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(255,255,255,0.9)",
                padding: "0.5rem 1rem",
                borderRadius: "2rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#1e293b"
            }}
        >
            <span style={{
                display: "block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#22c55e",
                boxShadow: "0 0 0 2px rgba(34, 197, 94, 0.2)"
            }}></span>
            {activeCount} Users Online
        </motion.div>
    );
};

export default ActiveUsersWidget;
