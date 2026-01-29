import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../components/PageTransition";
import BackgroundBubbles from "../components/BackgroundBubbles";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { user, login, register, requestOtp } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Toggle between Sign In and Sign Up
    const [isSignUp, setIsSignUp] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            if (user.role === "Admin") {
                navigate("/admin-dashboard");
            } else {
                navigate("/");
            }
        }
    }, [user, navigate]);

    // Clear form when switching modes
    const switchMode = () => {
        setIsSignUp(!isSignUp);
        setError("");
        setSuccess("");
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
    };

    // Handle Sign In
    const handleSignIn = (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        setTimeout(() => {
            const result = login(email, password);

            if (result.success) {
                setLoading(false);
                if (result.user.role === "Admin") {
                    navigate("/admin-dashboard");
                } else {
                    navigate("/");
                }
            } else {
                setError(result.message);
                setLoading(false);
            }
        }, 600);
    };

    // Validate college email - only PSR college IDs allowed
    const validateCollegeEmail = (emailToCheck) => {
        const email = emailToCheck.toLowerCase().trim();

        // Must end with @psr.edu.in
        if (!email.endsWith('@psr.edu.in')) {
            return { valid: false, message: "Only PSR college email IDs are allowed (@psr.edu.in)" };
        }

        // Extract the ID part before @
        const idPart = email.split('@')[0];

        // Valid format: 23it001 to 23it030
        const validPattern = /^23it0(0[1-9]|[12][0-9]|30)$/;

        if (!validPattern.test(idPart)) {
            return { valid: false, message: "Invalid college ID. Only 23IT001 to 23IT030 are allowed." };
        }

        // Check if admin (23it008)
        const isAdmin = idPart === '23it008';

        return { valid: true, isAdmin };
    };

    // Handle Sign Up
    const handleSignUp = (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        // Validation
        if (!name.trim()) {
            setError("Please enter your name.");
            setLoading(false);
            return;
        }

        // Validate college email
        const emailValidation = validateCollegeEmail(email);
        if (!emailValidation.valid) {
            setError(emailValidation.message);
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        // Determine role based on email
        const role = emailValidation.isAdmin ? "Admin" : "Student";

        setTimeout(() => {
            const result = register({ name, email: email.toLowerCase(), password, role });

            if (result.success) {
                setSuccess(`Account created as ${role}! You can now sign in.`);
                setIsSignUp(false);
                setPassword("");
                setConfirmPassword("");
            } else {
                setError(result.message);
            }
            setLoading(false);
        }, 600);
    };

    // Handle OTP Login Request
    const handleOtpLogin = async () => {
        if (!email) {
            setError("Please enter your college email to receive OTP.");
            return;
        }

        // Basic validation
        if (!email.includes('@')) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await requestOtp(email);
            if (result.success) {
                navigate("/verify-email", { state: { email } });
            } else {
                setError(result.message);
                setLoading(false);
            }
        } catch (err) {
            setError("Failed to request OTP. Please try again.");
            setLoading(false);
        }
    };

    // Input styles
    const inputStyle = {
        width: "100%",
        padding: "0.875rem 1rem",
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "0.75rem",
        fontSize: "0.95rem",
        color: "#334155",
        outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s"
    };

    const handleInputFocus = (e) => {
        e.target.style.borderColor = "#2563eb";
        e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
    };

    const handleInputBlur = (e) => {
        e.target.style.borderColor = "#e2e8f0";
        e.target.style.boxShadow = "none";
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
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: "2rem 0" }}>
                                    <Loader text={isSignUp ? "Creating account..." : "Signing in..."} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={isSignUp ? "signup" : "signin"}
                                    initial={{ opacity: 0, x: isSignUp ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {/* Header */}
                                    <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                                        <div style={{
                                            fontSize: "2.5rem",
                                            marginBottom: "0.75rem",
                                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                                        }}>
                                            {isSignUp ? "✨" : "🔍"}
                                        </div>
                                        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.25rem" }}>
                                            {isSignUp ? "Create Account" : "Welcome Back"}
                                        </h2>
                                        <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                                            {isSignUp ? "Join the Lost & Found community" : "Sign in to your account"}
                                        </p>
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            style={{
                                                color: "#dc2626",
                                                fontSize: "0.875rem",
                                                marginBottom: "1rem",
                                                background: "#fef2f2",
                                                padding: "0.75rem",
                                                borderRadius: "0.5rem",
                                                border: "1px solid #fecaca",
                                                textAlign: "center"
                                            }}
                                        >
                                            ⚠️ {error}
                                        </motion.div>
                                    )}

                                    {/* Success Message */}
                                    {success && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            style={{
                                                color: "#16a34a",
                                                fontSize: "0.875rem",
                                                marginBottom: "1rem",
                                                background: "#f0fdf4",
                                                padding: "0.75rem",
                                                borderRadius: "0.5rem",
                                                border: "1px solid #bbf7d0",
                                                textAlign: "center"
                                            }}
                                        >
                                            ✅ {success}
                                        </motion.div>
                                    )}

                                    {/* Form */}
                                    <form onSubmit={isSignUp ? handleSignUp : handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                                        {/* Name Field (Sign Up only) */}
                                        {isSignUp && (
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter your full name"
                                                    required
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    style={inputStyle}
                                                    onFocus={handleInputFocus}
                                                    onBlur={handleInputBlur}
                                                />
                                            </div>
                                        )}

                                        {/* Email Field */}
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                                                College Email ID
                                            </label>
                                            <input
                                                type="email"
                                                placeholder={isSignUp ? "23itXXX@psr.edu.in" : "Enter your college email"}
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                style={inputStyle}
                                                onFocus={handleInputFocus}
                                                onBlur={handleInputBlur}
                                            />
                                            {isSignUp && (
                                                <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                                                    Only PSR college IDs (23IT001-23IT030) are allowed
                                                </p>
                                            )}
                                        </div>

                                        {/* Password Field */}
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                                                Password
                                            </label>
                                            <div style={{ position: "relative" }}>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder={isSignUp ? "Create a password (min 6 chars)" : "Enter your password"}
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    style={{ ...inputStyle, paddingRight: "3rem" }}
                                                    onFocus={handleInputFocus}
                                                    onBlur={handleInputBlur}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    style={{
                                                        position: "absolute",
                                                        right: "12px",
                                                        top: "50%",
                                                        transform: "translateY(-50%)",
                                                        background: "none",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        color: "#64748b",
                                                        padding: "4px",
                                                        display: "flex",
                                                        alignItems: "center"
                                                    }}
                                                >
                                                    {showPassword ? "🙈" : "👁️"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Confirm Password (Sign Up only) */}
                                        {isSignUp && (
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                                                    Confirm Password
                                                </label>
                                                <div style={{ position: "relative" }}>
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="Confirm your password"
                                                        required
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        style={{ ...inputStyle, paddingRight: "3rem" }}
                                                        onFocus={handleInputFocus}
                                                        onBlur={handleInputBlur}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        style={{
                                                            position: "absolute",
                                                            right: "12px",
                                                            top: "50%",
                                                            transform: "translateY(-50%)",
                                                            background: "none",
                                                            border: "none",
                                                            cursor: "pointer",
                                                            color: "#64748b",
                                                            padding: "4px",
                                                            display: "flex",
                                                            alignItems: "center"
                                                        }}
                                                    >
                                                        {showConfirmPassword ? "🙈" : "👁️"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            style={{
                                                width: "100%",
                                                padding: "0.875rem 1rem",
                                                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "0.75rem",
                                                cursor: "pointer",
                                                fontSize: "0.95rem",
                                                fontWeight: 600,
                                                marginTop: "0.5rem",
                                                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
                                            }}
                                        >
                                            {isSignUp ? "Create Account" : "Sign In"}
                                        </motion.button>
                                    </form>

                                    {/* OTP Login Option */}
                                    {!isSignUp && (
                                        <div style={{ marginTop: "1.25rem" }}>
                                            <div style={{
                                                display: "flex", alignItems: "center", gap: "0.5rem",
                                                marginBottom: "1.25rem", color: "#94a3b8", fontSize: "0.8rem"
                                            }}>
                                                <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
                                                <span>OR</span>
                                                <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
                                            </div>

                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="button"
                                                onClick={handleOtpLogin}
                                                style={{
                                                    width: "100%",
                                                    padding: "0.875rem 1rem",
                                                    background: "white",
                                                    color: "#334155",
                                                    border: "1px solid #cbd5e1",
                                                    borderRadius: "0.75rem",
                                                    cursor: "pointer",
                                                    fontSize: "0.95rem",
                                                    fontWeight: 600,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: "0.5rem",
                                                    transition: "background 0.2s"
                                                }}
                                            >
                                                <span>📧</span> Sign in with Email OTP
                                            </motion.button>
                                        </div>
                                    )}

                                    {/* Switch between Sign In / Sign Up */}
                                    <div style={{
                                        marginTop: "1.5rem",
                                        textAlign: "center",
                                        fontSize: "0.9rem",
                                        color: "#64748b"
                                    }}>
                                        {isSignUp ? "Already have an account? " : "Don't have an account? "}
                                        <button
                                            onClick={switchMode}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                color: "#2563eb",
                                                fontWeight: 600,
                                                cursor: "pointer",
                                                textDecoration: "underline"
                                            }}
                                        >
                                            {isSignUp ? "Sign In" : "Sign Up"}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </PageTransition>
        </>
    );
}

export default Login;
