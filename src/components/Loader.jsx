import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

function Loader({ text = "Loading..." }) {
    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[200px] py-12">
            {/* Animated pulsing icon */}
            <motion.div
                className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5"
                animate={{
                    scale: [1, 1.08, 1],
                    opacity: [0.7, 1, 0.7],
                }}
                transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <Search size={24} />
            </motion.div>

            {/* Text with animated dots */}
            <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-slate-500">{text}</span>
                <div className="flex gap-0.5 ml-0.5">
                    {[0, 0.2, 0.4].map((delay, i) => (
                        <motion.span
                            key={i}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay }}
                            className="text-indigo-500 font-bold text-sm"
                        >
                            .
                        </motion.span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Loader;
