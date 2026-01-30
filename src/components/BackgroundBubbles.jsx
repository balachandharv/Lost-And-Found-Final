import React from "react";
import { motion } from "framer-motion";

function BackgroundBubbles() {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-50 pointer-events-none">
            {/* Orb 1 - Top Left - Soft Violet */}
            <motion.div
                animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-violet-300/20 rounded-full blur-[100px]"
            />

            {/* Orb 2 - Bottom Right - Soft Blue */}
            <motion.div
                animate={{
                    x: [0, -100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.5, 1],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-blue-300/20 rounded-full blur-[120px]"
            />

            {/* Orb 3 - Center Moving - Soft Mint */}
            <motion.div
                animate={{
                    x: [-50, 50, -50],
                    y: [-50, 50, -50],
                    opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] bg-emerald-200/10 rounded-full blur-[90px]"
            />
        </div>
    );
}

export default BackgroundBubbles;
