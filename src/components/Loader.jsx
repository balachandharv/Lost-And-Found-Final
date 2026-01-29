import React from "react";
import { motion } from "framer-motion";

function Loader({ text = "Loading..." }) {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
            minHeight: "200px"
        }}>
            <motion.div
                style={{ fontSize: "3rem", marginBottom: "1rem" }}
                animate={{
                    x: [-20, 20, -20],
                    rotate: [0, 10, -10, 0]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                🔍
            </motion.div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 500, color: "var(--text-muted)" }}>{text}</span>
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    style={{ fontSize: "1.5rem", color: "var(--primary)" }}
                >.</motion.span>
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                    style={{ fontSize: "1.5rem", color: "var(--primary)" }}
                >.</motion.span>
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                    style={{ fontSize: "1.5rem", color: "var(--primary)" }}
                >.</motion.span>
            </div>
        </div>
    );
}

export default Loader;
