import React from "react";
import { motion } from "framer-motion";

const pageVariants = {
    initial: {
        opacity: 0,
        y: 10,
        scale: 0.99
    },
    in: {
        opacity: 1,
        y: 0,
        scale: 1
    },
    out: {
        opacity: 0,
        y: -10,
        scale: 1.01
    }
};

const pageTransition = {
    type: "tween",
    ease: "easeInOut",
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
            style={{ width: "100%" }}
        >
            {children}
        </motion.div>
    );
}

export default PageTransition;
