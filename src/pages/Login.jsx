import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../components/PageTransition";
import BackgroundBubbles from "../components/BackgroundBubbles";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { user, login, register, requestOtp, resetPassword } = useAuth();
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

    // Forgot Password States
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetStep, setResetStep] = useState(1);
    const [otp, setOtp] = useState("");

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
        setIsForgotPassword(false);
        setResetStep(1);
        setError("");
        setSuccess("");
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setOtp("");
    };

    // Handle Sign In
    const handleSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await login(email, password);

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
        } catch (err) {
            setError("Login failed. Please try again.");
            setLoading(false);
        }
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
    const handleSignUp = async (e) => {
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

        try {
            const result = await register({ name, email: email.toLowerCase(), password, role });

            if (result.success) {
                setSuccess(`Account created as ${role}! You can now sign in.`);
                setIsSignUp(false);
                setPassword("");
                setConfirmPassword("");
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError("Registration failed.");
        }
        setLoading(false);
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

    // Handle Request Reset OTP
    const handleRequestResetOtp = async (e) => {
        e.preventDefault();
        if (!email) {
            setError("Please enter your email.");
            return;
        }
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const result = await requestOtp(email, 'reset');
            if (result.success) {
                setResetStep(2);
                setSuccess("OTP sent! Please check your email.");
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError("Failed to send OTP.");
        }
        setLoading(false);
    };

    // Handle Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!otp || !password || !confirmPassword) {
            setError("All fields are required.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await resetPassword(email, otp, password);
            if (result.success) {
                setSuccess("Password reset successfully! You can now sign in.");
                setTimeout(() => {
                    setIsForgotPassword(false);
                    setResetStep(1);
                    setOtp("");
                    setPassword("");
                    setConfirmPassword("");
                    setSuccess("");
                }, 2000);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError("Failed to reset password.");
        }
        setLoading(false);
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
                                    <Loader text={
                                        isForgotPassword ? "Processing..." :
                                            isSignUp ? "Creating account..." : "Signing in..."
                                    } />
                                </motion.div>
                            ) : isForgotPassword ? (
                                <motion.div
                                    key="forgot-password"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                                        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔐</div>
                                        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.25rem" }}>
                                            {resetStep === 1 ? "Forgot Password?" : "Reset Password"}
                                        </h2>
                                        <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                                            {resetStep === 1
                                                ? "Enter your email to receive a reset code"
                                                : "Enter the code sent to your email"}
                                        </p>
                                    </div>

                                    {error && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{
                                            color: "#dc2626", fontSize: "0.875rem", marginBottom: "1rem", background: "#fef2f2",
                                            padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #fecaca", textAlign: "center"
                                        }}>
                                            ⚠️ {error}
                                        </motion.div>
                                    )}

                                    {success && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{
                                            color: "#16a34a", fontSize: "0.875rem", marginBottom: "1rem", background: "#f0fdf4",
                                            padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #bbf7d0", textAlign: "center"
                                        }}>
                                            ✅ {success}
                                        </motion.div>
                                    )}

                                    <form onSubmit={resetStep === 1 ? handleRequestResetOtp : handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                                        {/* Step 1: Email Only */}
                                        <div style={{ display: resetStep === 1 ? 'block' : 'none' }}>
                                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                                                College Email ID
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="23itXXX@psr.edu.in"
                                                required={resetStep === 1}
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                style={inputStyle}
                                                onFocus={handleInputFocus}
                                                onBlur={handleInputBlur}
                                            />
                                        </div>

                                        {/* Step 2: OTP and New Password */}
                                        {resetStep === 2 && (
                                            <>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                                                        Enter OTP Code
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter OTP code"
                                                        required
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value)}
                                                        style={{ ...inputStyle, textAlign: 'center', letterSpacing: '0.2rem', fontWeight: 'bold' }}
                                                        onFocus={handleInputFocus}
                                                        onBlur={handleInputBlur}
                                                    />
                                                </div>

                                                <div>
                                                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                                                        New Password
                                                    </label>
                                                    <div style={{ position: "relative" }}>
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="New password (min 6 chars)"
                                                            required
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            style={{ ...inputStyle, paddingRight: "3rem" }}
                                                            onFocus={handleInputFocus}
                                                            onBlur={handleInputBlur}
                                                        />
                                                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                                                            position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                                                            background: "none", border: "none", cursor: "pointer", color: "#64748b",
                                                            display: "flex", alignItems: "center"
                                                        }}>
                                                            {showPassword ? (
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "1.25rem", height: "1.25rem" }}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                                </svg>
                                                            ) : (
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "1.25rem", height: "1.25rem" }}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                                                        Confirm New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        placeholder="Confirm new password"
                                                        required
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        style={inputStyle}
                                                        onFocus={handleInputFocus}
                                                        onBlur={handleInputBlur}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            style={{
                                                width: "100%", padding: "0.875rem 1rem",
                                                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                                                color: "white", border: "none", borderRadius: "0.75rem",
                                                cursor: "pointer", fontSize: "0.95rem", fontWeight: 600,
                                                marginTop: "0.5rem", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
                                            }}
                                        >
                                            {resetStep === 1 ? "Send Reset Code" : "Reset Password"}
                                        </motion.button>
                                    </form>

                                    <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                                        <button
                                            onClick={() => {
                                                setIsForgotPassword(false);
                                                setResetStep(1);
                                                setError("");
                                                setSuccess("");
                                            }}
                                            style={{
                                                background: "none", border: "none", color: "#64748b",
                                                fontSize: "0.875rem", cursor: "pointer", textDecoration: "underline"
                                            }}
                                        >
                                            Back to Sign In
                                        </button>
                                    </div>
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
                                                    {showPassword ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "1.25rem", height: "1.25rem" }}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "1.25rem", height: "1.25rem" }}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                            {!isSignUp && (
                                                <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsForgotPassword(true);
                                                            setResetStep(1);
                                                            setError("");
                                                            setSuccess("");
                                                        }}
                                                        style={{
                                                            background: "none",
                                                            border: "none",
                                                            color: "#2563eb",
                                                            fontSize: "0.8rem",
                                                            cursor: "pointer",
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        Forgot Password?
                                                    </button>
                                                </div>
                                            )}
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
                                                        {showConfirmPassword ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "1.25rem", height: "1.25rem" }}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "1.25rem", height: "1.25rem" }}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                        )}
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
