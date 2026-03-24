import React from "react";
import { motion } from "framer-motion";

const pageVariants = {
    initial: {
        opacity: 0,
        y: 6,
    },
    in: {
        opacity: 1,
        y: 0,
    },
    out: {
        opacity: 0,
        y: -4,
    }
};

const pageTransition = {
    type: "tween",
    ease: [0.25, 0.1, 0.25, 1], // CSS ease — smooth and natural
    duration: 0.3
};

function PageTransition({ children }) {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            style={{ width: "100%", willChange: "opacity, transform" }}
        >
            {children}
        </motion.div>
    );
}

export default PageTransition;
