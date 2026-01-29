import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../components/PageTransition";
import BackgroundBubbles from "../components/BackgroundBubbles";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { user, login, register } = useAuth();
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
        }, 800);
    };

    // Handle Sign Up
    const handleSignUp = (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        // Validation
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

        setTimeout(() => {
            const result = register({ name, email, password, role: "Student" });

            if (result.success) {
                setSuccess("Account created successfully! You can now sign in.");
                setIsSignUp(false);
                setPassword("");
                setConfirmPassword("");
            } else {
                setError(result.message);
            }
            setLoading(false);
        }, 800);
    };

    // Handle Google Sign In (Quick login for demo)
    const handleGoogleSignIn = () => {
        setLoading(true);
        setError("");

        setTimeout(() => {
            setLoading(false);
            setShowAccountSelect(true);
        }, 500);
    };

    const [showAccountSelect, setShowAccountSelect] = useState(false);

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
                            ) : showAccountSelect ? (
                                <motion.div key="select" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                    <AccountSelector
                                        onSelect={(userData) => {
                                            setShowAccountSelect(false);
                                            setLoading(true);
                                            setTimeout(() => {
                                                login(userData.email, userData.password);
                                                setLoading(false);
                                                if (userData.role === "Admin") {
                                                    navigate("/admin-dashboard");
                                                } else {
                                                    navigate("/");
                                                }
                                            }, 500);
                                        }}
                                        onBack={() => setShowAccountSelect(false)}
                                    />
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
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="Enter your email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                style={inputStyle}
                                                onFocus={handleInputFocus}
                                                onBlur={handleInputBlur}
                                            />
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
                                                    {showPassword ? (
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                            <line x1="1" y1="1" x2="23" y2="23" />
                                                        </svg>
                                                    ) : (
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                            <circle cx="12" cy="12" r="3" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Confirm Password (Sign Up only) */}
                                        {isSignUp && (
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                                                    Confirm Password
                                                </label>
                                                <input
                                                    type="password"
                                                    placeholder="Confirm your password"
                                                    required
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    style={inputStyle}
                                                    onFocus={handleInputFocus}
                                                    onBlur={handleInputBlur}
                                                />
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
                                                background: "#0f172a",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "0.75rem",
                                                cursor: "pointer",
                                                fontSize: "0.95rem",
                                                fontWeight: 600,
                                                marginTop: "0.5rem"
                                            }}
                                        >
                                            {isSignUp ? "Create Account" : "Sign In"}
                                        </motion.button>
                                    </form>

                                    {/* Divider (only for Sign In) */}
                                    {!isSignUp && (
                                        <>
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                margin: "1.25rem 0",
                                                gap: "1rem"
                                            }}>
                                                <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
                                                <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>or</span>
                                                <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
                                            </div>

                                            {/* Google Sign In Button */}
                                            <motion.button
                                                whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleGoogleSignIn}
                                                style={{
                                                    width: "100%",
                                                    padding: "0.875rem 1rem",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: "0.75rem",
                                                    background: "white",
                                                    border: "1px solid #e2e8f0",
                                                    borderRadius: "0.75rem",
                                                    cursor: "pointer",
                                                    fontSize: "0.95rem",
                                                    fontWeight: 500,
                                                    color: "#1e293b",
                                                    transition: "all 0.2s"
                                                }}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                </svg>
                                                Continue with Google
                                            </motion.button>
                                        </>
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

// Account Selector Component for Google Sign In
function AccountSelector({ onSelect, onBack }) {
    const DEMO_ACCOUNTS = [
        { email: "cmariappan15@gmail.com", password: "student123", role: "Student", name: "Student User" },
        { email: "balachandhar021@gmail.com", password: "admin123", role: "Admin", name: "Admin User" }
    ];

    return (
        <>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem" }}>
                    Choose an account
                </h2>
                <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                    to continue to College Lost & Found
                </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {DEMO_ACCOUNTS.map((account) => (
                    <motion.button
                        key={account.email}
                        whileHover={{ scale: 1.02, backgroundColor: "#f8fafc" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(account)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            padding: "1rem",
                            background: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "0.75rem",
                            cursor: "pointer",
                            textAlign: "left",
                            width: "100%"
                        }}
                    >
                        <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: account.role === "Admin" ? "#dc2626" : "#2563eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "1.1rem"
                        }}>
                            {account.name[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.95rem" }}>
                                {account.name}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                                {account.email}
                            </div>
                        </div>
                        <span style={{
                            fontSize: "0.7rem",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "0.25rem",
                            background: account.role === "Admin" ? "#fef2f2" : "#eff6ff",
                            color: account.role === "Admin" ? "#dc2626" : "#2563eb",
                            fontWeight: 600
                        }}>
                            {account.role}
                        </span>
                    </motion.button>
                ))}
            </div>

            <button
                onClick={onBack}
                style={{
                    marginTop: "1.5rem",
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "center"
                }}
            >
                ← Back to login
            </button>
        </>
    );
}

export default Login;
