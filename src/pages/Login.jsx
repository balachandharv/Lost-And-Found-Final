import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../components/PageTransition";
import BackgroundBubbles from "../components/BackgroundBubbles";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, User, Eye, EyeOff, CheckCircle, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, login, register, requestOtp, resetPassword } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Get redirect info from protected route
    const from = location.state?.from || "/";
    const redirectMessage = location.state?.message || "";

    // Toggle between Sign In and Sign Up
    const [isSignUp, setIsSignUp] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

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
                    // Redirect to the page user was trying to access, or home
                    navigate(from);
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

    // Validate college email
    const validateCollegeEmail = (emailToCheck) => {
        const email = emailToCheck.toLowerCase().trim();

        // Must end with @psr.edu.in
        if (!email.endsWith('@psr.edu.in')) {
            return { valid: false, message: "Only PSR college email IDs are allowed (@psr.edu.in)" };
        }

        return { valid: true };
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

        // Determine role
        const role = "Student";

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
                if (result.debugOtp) alert(`TEST MODE OTP: ${result.debugOtp}`);
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
                // For testing convenience:
                if (result.debugOtp) {
                    alert(`TEST MODE OTP: ${result.debugOtp}`);
                    console.log("Debug OTP:", result.debugOtp);
                }
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

    return (
        <>
            <BackgroundBubbles />
            <PageTransition>
                <div className="min-h-screen flex items-center justify-center p-4">
                    <motion.div
                        className="bg-white/90 backdrop-blur-lg border border-white/50 shadow-2xl rounded-3xl w-full max-w-md p-8 md:p-10 relative overflow-hidden"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12">
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
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                                            <Lock size={32} />
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                            {resetStep === 1 ? "Forgot Password?" : "Reset Password"}
                                        </h2>
                                        <p className="text-slate-500 text-sm">
                                            {resetStep === 1
                                                ? "Enter your email to receive a reset code"
                                                : "Enter the code sent to your email"}
                                        </p>
                                    </div>

                                    {error && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-3">
                                            <AlertTriangle size={18} /> {error}
                                        </motion.div>
                                    )}

                                    {success && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm flex items-center gap-3">
                                            <CheckCircle size={18} /> {success}
                                        </motion.div>
                                    )}

                                    <form onSubmit={resetStep === 1 ? handleRequestResetOtp : handleResetPassword} className="space-y-5">

                                        {/* Step 1: Email Only */}
                                        <div className={resetStep === 1 ? 'block' : 'hidden'}>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                College Email ID
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="email"
                                                    placeholder="23itXXX@psr.edu.in"
                                                    required={resetStep === 1}
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                                                />
                                            </div>
                                        </div>

                                        {/* Step 2: OTP and New Password */}
                                        {resetStep === 2 && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        Enter OTP Code
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter OTP"
                                                        required
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value)}
                                                        className="w-full text-center tracking-widest font-bold text-lg py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        New Password
                                                    </label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Min 6 characters"
                                                            required
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                                        >
                                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        Confirm Password
                                                    </label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                        <input
                                                            type="password"
                                                            placeholder="Confirm new password"
                                                            required
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all"
                                        >
                                            {resetStep === 1 ? "Send Reset Code" : "Reset Password"} <ArrowRight size={18} />
                                        </motion.button>
                                    </form>

                                    <div className="mt-8 text-center border-t border-slate-100 pt-6">
                                        <button
                                            onClick={() => {
                                                setIsForgotPassword(false);
                                                setResetStep(1);
                                                setError("");
                                                setSuccess("");
                                            }}
                                            className="text-slate-500 hover:text-indigo-600 text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
                                        >
                                            <ArrowLeft size={16} /> Back to Sign In
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
                                    <div className="text-center mb-8">
                                        <div className="text-4xl mb-4">
                                            {isSignUp ? "✨" : "🔍"}
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                            {isSignUp ? "Create Account" : "Welcome Back"}
                                        </h2>
                                        <p className="text-slate-500 text-sm">
                                            {isSignUp ? "Join the Lost & Found community" : "Sign in to your account to continue"}
                                        </p>
                                    </div>

                                    {/* Redirect Message (when coming from protected route) */}
                                    {redirectMessage && !isSignUp && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 text-sm flex items-center gap-3"
                                        >
                                            <Lock size={18} /> {redirectMessage}
                                        </motion.div>
                                    )}

                                    {/* Error Message */}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-3"
                                        >
                                            <AlertTriangle size={18} /> {error}
                                        </motion.div>
                                    )}

                                    {/* Success Message */}
                                    {success && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm flex items-center gap-3"
                                        >
                                            <CheckCircle size={18} /> {success}
                                        </motion.div>
                                    )}

                                    {/* Form */}
                                    <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">

                                        {/* Name Field (Sign Up only) */}
                                        {isSignUp && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                                    Full Name
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input
                                                        type="text"
                                                        placeholder="John Doe"
                                                        required
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Email Field */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                                College Email ID
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="email"
                                                    placeholder={isSignUp ? "23itXXX@psr.edu.in" : "23itXXX@psr.edu.in"}
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                                                />
                                            </div>
                                            {isSignUp && (
                                                <p className="text-xs text-slate-400 mt-1.5 ml-1">
                                                    Use your official @psr.edu.in email
                                                </p>
                                            )}
                                        </div>

                                        {/* Password Field */}
                                        <div>
                                            <div className="flex justify-between items-center mb-1.5">
                                                <label className="text-sm font-medium text-slate-700">
                                                    Password
                                                </label>
                                                {!isSignUp && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsForgotPassword(true);
                                                            setResetStep(1);
                                                            setError("");
                                                            setSuccess("");
                                                        }}
                                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                                                    >
                                                        Forgot Password?
                                                    </button>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder={isSignUp ? "Min 6 characters" : "••••••••"}
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(prev => !prev)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff size={18} />
                                                    ) : (
                                                        <Eye size={18} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Confirm Password (Sign Up only) */}
                                        {isSignUp && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                                    Confirm Password
                                                </label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Confirm password"
                                                        required
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            className="w-full mt-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all"
                                        >
                                            {isSignUp ? (
                                                <>Create Account <ArrowRight size={18} /></>
                                            ) : (
                                                <>Sign In <ArrowRight size={18} /></>
                                            )}
                                        </motion.button>
                                    </form>



                                    {/* Switch between Sign In / Sign Up */}
                                    <div className="mt-8 text-center text-sm text-slate-500">
                                        {isSignUp ? "Already have an account? " : "Don't have an account? "}
                                        <button
                                            onClick={switchMode}
                                            className="text-indigo-600 font-bold hover:underline hover:text-indigo-700"
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
