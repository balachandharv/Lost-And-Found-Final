import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";

const ActiveUsersWidget = () => {
    const [activeCount, setActiveCount] = useState(1); // Start with at least userself
    const [trend, setTrend] = useState("stable"); // 'up', 'down', 'stable'

    useEffect(() => {
        // Connect to the backend socket
        const socket = io("http://localhost:5000");

        socket.on("connect", () => {
            console.log("Connected to socket server");
        });

        socket.on("activeUsers", (count) => {
            setActiveCount(prev => {
                const newCount = count;
                if (newCount > prev) setTrend("up");
                else if (newCount < prev) setTrend("down");
                else setTrend("stable");
                return newCount;
            });
        });

        return () => {
            socket.disconnect();
        };
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
                color: "#1e293b",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.5)"
            }}
        >
            <div style={{ position: "relative", width: "10px", height: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{
                    display: "block",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#22c55e",
                    position: "relative",
                    zIndex: 2
                }}></span>
                <motion.span
                    initial={{ x: "-50%", y: "-50%" }}
                    animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        backgroundColor: "#22c55e",
                        zIndex: 1
                    }}
                />
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                <AnimatePresence mode="popLayout">
                    <motion.span
                        key={activeCount}
                        initial={{ y: trend === 'up' ? 10 : -10, opacity: 0, filter: "blur(2px)" }}
                        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                        exit={{ y: trend === 'up' ? -10 : 10, opacity: 0, filter: "blur(2px)" }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                        style={{ display: "inline-block", minWidth: "1.2rem", textAlign: "center", fontWeight: "bold" }}
                    >
                        {activeCount}
                    </motion.span>
                </AnimatePresence>
                <span>Users Online</span>
            </div>
        </motion.div>
    );
};

export default ActiveUsersWidget;
