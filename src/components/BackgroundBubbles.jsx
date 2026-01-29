import React, { useEffect, useState } from "react";

function BackgroundBubbles() {
    const [bubbles, setBubbles] = useState([]);

    useEffect(() => {
        // Generate random bubbles
        const newBubbles = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            size: `${Math.random() * 60 + 20}px`,
            duration: `${Math.random() * 10 + 10}s`,
            delay: `${Math.random() * 5}s`
        }));
        setBubbles(newBubbles);
    }, []);

    return (
        <div className="bubbles-container">
            {bubbles.map(bubble => (
                <div
                    key={bubble.id}
                    className="bubble"
                    style={{
                        left: bubble.left,
                        width: bubble.size,
                        height: bubble.size,
                        animationDuration: bubble.duration,
                        animationDelay: bubble.delay
                    }}
                />
            ))}
        </div>
    );
}

export default BackgroundBubbles;
