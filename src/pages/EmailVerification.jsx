import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../components/PageTransition";
import BackgroundBubbles from "../components/BackgroundBubbles";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

function EmailVerification() {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyOtp, resendOtp } = useAuth();

    // Get email from navigation state
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        if (location.state && location.state.email) {
            setEmail(location.state.email);
        } else {
            // If no email provided, redirect to login
            navigate("/login");
        }
    }, [location, navigate]);

    // Countdown timer
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value !== "") {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            if (e.target.previousSibling && e.target.value === "") {
                e.target.previousSibling.focus();
            }
        }
        if (e.key === "Enter") {
            handleVerify(e);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData("text");
        if (!/^[0-9]{6}$/.test(data)) return;

        const digits = data.split("");
        setOtp(digits);
        // Focus the last input
        const inputs = document.querySelectorAll("input[type='text']");
        if (inputs[5]) inputs[5].focus();
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            setError("Please enter the complete 6-digit code.");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const result = await verifyOtp(email, otpCode);

            if (result.success) {
                setSuccess("Email verified successfully!");
                setTimeout(() => {
                    if (result.user.role === "Admin") {
                        navigate("/admin-dashboard");
                    } else {
                        navigate("/");
                    }
                }, 1000);
            } else {
                setError(result.message || "Verification failed. Please try again.");
                setLoading(false);
            }
        } catch (err) {
            setError("An unexpected error occurred.");
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        setLoading(true);
        setError("");

        try {
            const result = await resendOtp(email);
            if (result.success) {
                setSuccess("OTP resent successfully!");
                setTimer(30);
            } else {
                setError(result.message || "Failed to resend OTP.");
            }
        } catch (err) {
            setError("Could not resend OTP. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <BackgroundBubbles />
            <PageTransition>
                <div style={{
                    minHeight: "80vh",
                    display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
                }}>
                    <motion.div
                        className="glass"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        style={{
                            width: "100%", maxWidth: "420px",
                            padding: "2.5rem", borderRadius: "1.5rem",
                            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                            border: "1px solid rgba(255, 255, 255, 0.5)",
                            background: "rgba(255, 255, 255, 0.92)"
                        }}
                    >
                        {loading ? (
                            <div style={{ padding: "2rem 0" }}>
                                <Loader text="Verifying..." />
                            </div>
                        ) : (
                            <div>
                                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                                    <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
                                        ✉️
                                    </div>
                                    <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.25rem" }}>
                                        Verify Email
                                    </h2>
                                    <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                                        We sent a code to <br />
                                        <span style={{ fontWeight: 600, color: "#0f172a" }}>{email}</span>
                                    </p>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            color: "#dc2626", fontSize: "0.875rem", marginBottom: "1rem",
                                            background: "#fef2f2", padding: "0.75rem", borderRadius: "0.5rem",
                                            textAlign: "center"
                                        }}
                                    >
                                        ⚠️ {error}
                                    </motion.div>
                                )}

                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            color: "#16a34a", fontSize: "0.875rem", marginBottom: "1rem",
                                            background: "#f0fdf4", padding: "0.75rem", borderRadius: "0.5rem",
                                            textAlign: "center"
                                        }}
                                    >
                                        ✅ {success}
                                    </motion.div>
                                )}

                                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                                    {otp.map((data, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            maxLength="1"
                                            value={data}
                                            onChange={(e) => handleChange(e.target, index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            onPaste={handlePaste}
                                            onFocus={(e) => e.target.select()}
                                            style={{
                                                width: "3rem", height: "3.5rem",
                                                textAlign: "center", fontSize: "1.25rem", fontWeight: "bold",
                                                borderRadius: "0.75rem", border: "1px solid #e2e8f0",
                                                outline: "none", backgroundColor: "#f8fafc", color: "#334155",
                                                transition: "all 0.2s"
                                            }}
                                        />
                                    ))}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleVerify}
                                    style={{
                                        width: "100%", padding: "0.875rem 1rem",
                                        background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                                        color: "white", border: "none", borderRadius: "0.75rem",
                                        cursor: "pointer", fontSize: "0.95rem", fontWeight: 600,
                                        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
                                    }}
                                >
                                    Verify Code
                                </motion.button>

                                <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                                    <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                                        Didn't receive the code?{" "}
                                        <button
                                            onClick={handleResend}
                                            disabled={timer > 0}
                                            style={{
                                                background: "none", border: "none",
                                                color: timer > 0 ? "#94a3b8" : "#2563eb",
                                                cursor: timer > 0 ? "default" : "pointer",
                                                fontWeight: 600
                                            }}
                                        >
                                            {timer > 0 ? `Resend in ${timer}s` : "Resend"}
                                        </button>
                                    </p>
                                    <button
                                        onClick={() => navigate("/login")}
                                        style={{
                                            background: "none", border: "none",
                                            color: "#64748b", fontSize: "0.875rem",
                                            marginTop: "1rem", cursor: "pointer",
                                            textDecoration: "underline"
                                        }}
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </PageTransition>
        </>
    );
}

export default EmailVerification;
