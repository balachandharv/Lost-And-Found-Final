import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../components/PageTransition";
import BackgroundBubbles from "../components/BackgroundBubbles";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    // Step 1: Email, Step 2: OTP
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [userName, setUserName] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Step 1: Request OTP
    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const result = await authAPI.requestOTP(email);

            if (result.success) {
                setUserName(result.userName || "User");
                setSuccess("OTP sent to your email! Check your inbox.");
                setStep(2);
            } else {
                setError(result.message || "Failed to send OTP");
            }
        } catch (err) {
            setError("Network error. Make sure the backend server is running.");
        }

        setLoading(false);
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await authAPI.verifyOTP(email, otp);

            if (result.success) {
                // Store token
                localStorage.setItem("token", result.token);

                // Login via context
                login(result.user);

                // Navigate based on role
                if (result.user.role === "Admin") {
                    navigate("/admin-dashboard");
                } else {
                    navigate("/");
                }
            } else {
                setError(result.message || "Invalid OTP");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        }

        setLoading(false);
    };

    // Go back to step 1
    const handleBack = () => {
        setStep(1);
        setOtp("");
        setError("");
        setSuccess("");
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
                            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.5)",
                            background: "rgba(255, 255, 255, 0.85)"
                        }}
                    >
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: "2rem 0" }}>
                                    <Loader text={step === 1 ? "Sending OTP..." : "Verifying..."} />
                                </motion.div>
                            ) : (
                                <motion.div key={`step-${step}`} initial={{ opacity: 0, x: step === 1 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>

                                    {/* Header */}
                                    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                                        <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
                                            {step === 1 ? "🔒" : "📧"}
                                        </div>
                                        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1e293b", marginBottom: "0.5rem" }}>
                                            {step === 1 ? "Secure Login" : `Hello, ${userName}!`}
                                        </h2>
                                        <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                                            {step === 1 ? "Enter your authorized email to continue" : "Enter the 6-digit code sent to your email"}
                                        </p>

                                        {/* Error Message */}
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "1rem", background: "#fef2f2", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #fecaca" }}
                                            >
                                                ⚠️ {error}
                                            </motion.div>
                                        )}

                                        {/* Success Message */}
                                        {success && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                style={{ color: "#16a34a", fontSize: "0.875rem", marginTop: "1rem", background: "#f0fdf4", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #bbf7d0" }}
                                            >
                                                ✅ {success}
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Step 1: Email Form */}
                                    {step === 1 && (
                                        <form onSubmit={handleRequestOTP} style={{ display: "grid", gap: "1rem" }}>
                                            <input
                                                type="email"
                                                placeholder="Enter your email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                style={inputStyle}
                                                autoFocus
                                            />

                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit"
                                                style={buttonStyle}
                                            >
                                                Send OTP 📨
                                            </motion.button>

                                            <p style={{ fontSize: "0.75rem", color: "#94a3b8", textAlign: "center", marginTop: "0.5rem" }}>
                                                Only authorized emails can access this system
                                            </p>
                                        </form>
                                    )}

                                    {/* Step 2: OTP Form */}
                                    {step === 2 && (
                                        <form onSubmit={handleVerifyOTP} style={{ display: "grid", gap: "1rem" }}>
                                            <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                                                <span style={{ fontSize: "0.875rem", color: "#64748b" }}>
                                                    Code sent to: <strong>{email}</strong>
                                                </span>
                                            </div>

                                            <input
                                                type="text"
                                                placeholder="Enter 6-digit OTP"
                                                required
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                                style={{
                                                    ...inputStyle,
                                                    textAlign: "center",
                                                    fontSize: "1.5rem",
                                                    letterSpacing: "0.5rem",
                                                    fontWeight: "bold"
                                                }}
                                                autoFocus
                                                maxLength={6}
                                            />

                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit"
                                                disabled={otp.length !== 6}
                                                style={{
                                                    ...buttonStyle,
                                                    opacity: otp.length !== 6 ? 0.6 : 1,
                                                    cursor: otp.length !== 6 ? "not-allowed" : "pointer"
                                                }}
                                            >
                                                Verify & Login ✓
                                            </motion.button>

                                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                                                <button
                                                    type="button"
                                                    onClick={handleBack}
                                                    style={{ background: "none", border: "none", color: "#64748b", fontSize: "0.875rem", cursor: "pointer" }}
                                                >
                                                    ← Change Email
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleRequestOTP}
                                                    style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.875rem", cursor: "pointer", fontWeight: 600 }}
                                                >
                                                    Resend OTP
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </PageTransition>
        </>
    );
}

const inputStyle = {
    width: "100%",
    padding: "1rem",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "0.75rem",
    fontSize: "0.95rem",
    color: "#334155",
    outline: "none",
    transition: "border-color 0.2s"
};

const buttonStyle = {
    width: "100%",
    padding: "1rem",
    fontSize: "1rem",
    marginTop: "0.5rem",
    backgroundColor: "#0f172a",
    color: "white",
    border: "none",
    borderRadius: "0.75rem",
    fontWeight: 600,
    cursor: "pointer"
};

export default Login;
