import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../components/PageTransition";
import BackgroundBubbles from "../components/BackgroundBubbles";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, User, UserPlus, Search, Eye, EyeOff, CheckCircle, AlertTriangle, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

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
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Forgot Password States
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetStep, setResetStep] = useState(1); // 1=email, 2=OTP, 3=new password
    const [otp, setOtp] = useState("");
    const [otpTimer, setOtpTimer] = useState(0);

    // OTP countdown timer
    useEffect(() => {
        if (otpTimer > 0) {
            const interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [otpTimer]);

    // Password strength checker
    const getPasswordStrength = (pwd) => {
        if (!pwd) return { score: 0, label: '', color: '' };
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
        if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-500' };
        if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-500' };
        if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
        return { score: 5, label: 'Excellent', color: 'bg-emerald-600' };
    };

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

        // Must end with @psr.edu.in or @psr.edu
        if (!email.endsWith('@psr.edu.in') && !email.endsWith('@psr.edu')) {
            return { valid: false, message: "Only PSR college email IDs are allowed (@psr.edu.in or @psr.edu)" };
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

    // Handle Request Reset OTP (Step 1 → Step 2)
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
                setOtpTimer(60); // Start 60-second resend cooldown
                setSuccess("A 6-digit code has been sent to your email.");
                if (result.debugOtp) {
                    alert(`DEV MODE — Your OTP is: ${result.debugOtp}`);
                }
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError("Failed to send OTP. Please try again.");
        }
        setLoading(false);
    };

    // Handle Resend OTP
    const handleResendOtp = async () => {
        if (otpTimer > 0) return;
        setLoading(true);
        setError("");
        try {
            const result = await requestOtp(email, 'reset');
            if (result.success) {
                setOtpTimer(60);
                setSuccess("New OTP sent to your email.");
                if (result.debugOtp) {
                    alert(`DEV MODE — Your new OTP is: ${result.debugOtp}`);
                }
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError("Failed to resend OTP.");
        }
        setLoading(false);
    };

    // Handle Verify OTP (Step 2 → Step 3)
    const handleVerifyResetOtp = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            setError("Please enter the complete 6-digit OTP code.");
            return;
        }
        setError("");
        setSuccess("");
        // Move to password step — OTP will be validated on final submission
        setResetStep(3);
        setSuccess("OTP verified! Set your new password below.");
    };

    // Handle Set New Password (Step 3 → Done)
    const handleSetNewPassword = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            setError("All fields are required.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (!/[A-Z]/.test(password)) {
            setError("Password must contain at least one uppercase letter.");
            return;
        }
        if (!/[0-9]/.test(password)) {
            setError("Password must contain at least one number.");
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
                setSuccess("Your password has been successfully updated.");
                setResetStep(4); // Show success screen
                setTimeout(() => {
                    setIsForgotPassword(false);
                    setResetStep(1);
                    setOtp("");
                    setPassword("");
                    setConfirmPassword("");
                    setSuccess("");
                    setError("");
                }, 3000);
            } else {
                setError(result.message);
                // If OTP was invalid, send back to OTP step
                if (result.message?.toLowerCase().includes('otp')) {
                    setResetStep(2);
                    setOtp("");
                }
            }
        } catch (err) {
            setError("Failed to reset password. Please try again.");
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
                                    {/* Step Progress Indicator */}
                                    {resetStep < 4 && (
                                        <div className="flex items-center justify-center gap-2 mb-6">
                                            {[1, 2, 3].map((step) => (
                                                <React.Fragment key={step}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                                        resetStep >= step 
                                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                                            : 'bg-slate-100 text-slate-400'
                                                    }`}>
                                                        {resetStep > step ? <CheckCircle size={16} /> : step}
                                                    </div>
                                                    {step < 3 && (
                                                        <div className={`w-8 h-0.5 rounded transition-all duration-300 ${resetStep > step ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    )}

                                    <div className="text-center mb-6">
                                        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-3 ${
                                            resetStep === 4 ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
                                        }`}>
                                            {resetStep === 4 ? <CheckCircle size={28} /> : resetStep === 2 ? <ShieldCheck size={28} /> : <Lock size={28} />}
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-800 mb-1">
                                            {resetStep === 1 && "Forgot Password?"}
                                            {resetStep === 2 && "Verify OTP"}
                                            {resetStep === 3 && "New Password"}
                                            {resetStep === 4 && "Password Updated!"}
                                        </h2>
                                        <p className="text-slate-500 text-sm">
                                            {resetStep === 1 && "Enter your registered email to receive a reset code"}
                                            {resetStep === 2 && `Enter the 6-digit code sent to ${email}`}
                                            {resetStep === 3 && "Create a strong password for your account"}
                                            {resetStep === 4 && "Your password has been successfully updated."}
                                        </p>
                                    </div>

                                    {error && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-3">
                                            <AlertTriangle size={16} className="shrink-0" /> {error}
                                        </motion.div>
                                    )}

                                    {success && resetStep !== 4 && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm flex items-center gap-3">
                                            <CheckCircle size={16} className="shrink-0" /> {success}
                                        </motion.div>
                                    )}

                                    {/* Step 4: Success Screen */}
                                    {resetStep === 4 ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center py-4"
                                        >
                                            <p className="text-slate-500 text-sm mb-4">Redirecting you to Sign In...</p>
                                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-emerald-500 rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '100%' }}
                                                    transition={{ duration: 3, ease: 'linear' }}
                                                />
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <form onSubmit={
                                            resetStep === 1 ? handleRequestResetOtp :
                                            resetStep === 2 ? handleVerifyResetOtp :
                                            handleSetNewPassword
                                        } className="space-y-5">

                                            {/* Step 1: Email */}
                                            {resetStep === 1 && (
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        College Email ID
                                                    </label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                        <input
                                                            type="email"
                                                            placeholder="e.g. 23it008@psr.edu.in"
                                                            required
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 2: OTP Verification */}
                                            {resetStep === 2 && (
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        Enter 6-Digit OTP
                                                    </label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        maxLength={6}
                                                        placeholder="● ● ● ● ● ●"
                                                        required
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                                        className="w-full text-center tracking-[0.5em] font-bold text-xl py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                                        autoFocus
                                                    />
                                                    <div className="flex items-center justify-between mt-3">
                                                        <p className="text-xs text-slate-400">
                                                            Code expires in 5 minutes
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={handleResendOtp}
                                                            disabled={otpTimer > 0}
                                                            className={`text-xs font-medium transition-colors ${
                                                                otpTimer > 0
                                                                    ? 'text-slate-300 cursor-not-allowed'
                                                                    : 'text-indigo-600 hover:text-indigo-800'
                                                            }`}
                                                        >
                                                            {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend Code'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 3: New Password */}
                                            {resetStep === 3 && (
                                                <>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                                            New Password
                                                        </label>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                            <input
                                                                type={showPassword ? "text" : "password"}
                                                                placeholder="Create a strong password"
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

                                                        {/* Password Strength Meter */}
                                                        {password && (
                                                            <div className="mt-2.5">
                                                                <div className="flex gap-1 mb-1.5">
                                                                    {[1, 2, 3, 4, 5].map((level) => (
                                                                        <div
                                                                            key={level}
                                                                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                                                                level <= getPasswordStrength(password).score
                                                                                    ? getPasswordStrength(password).color
                                                                                    : 'bg-slate-100'
                                                                            }`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <p className={`text-xs font-medium ${
                                                                    getPasswordStrength(password).score <= 1 ? 'text-red-500' :
                                                                    getPasswordStrength(password).score <= 2 ? 'text-orange-500' :
                                                                    getPasswordStrength(password).score <= 3 ? 'text-yellow-600' :
                                                                    'text-emerald-600'
                                                                }`}>
                                                                    {getPasswordStrength(password).label}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Validation Checklist */}
                                                        <div className="mt-3 space-y-1">
                                                            {[
                                                                { check: password.length >= 6, label: 'At least 6 characters' },
                                                                { check: /[A-Z]/.test(password), label: 'One uppercase letter' },
                                                                { check: /[0-9]/.test(password), label: 'One number' },
                                                                { check: /[^A-Za-z0-9]/.test(password), label: 'One special character (recommended)' },
                                                            ].map((rule, i) => (
                                                                <div key={i} className={`flex items-center gap-2 text-xs transition-colors ${
                                                                    rule.check ? 'text-emerald-600' : 'text-slate-400'
                                                                }`}>
                                                                    <CheckCircle size={12} className={rule.check ? 'text-emerald-500' : 'text-slate-300'} />
                                                                    {rule.label}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                                            Confirm Password
                                                        </label>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                            <input
                                                                type={showConfirmPassword ? "text" : "password"}
                                                                placeholder="Re-enter your new password"
                                                                required
                                                                value={confirmPassword}
                                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                                className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium ${
                                                                    confirmPassword && password !== confirmPassword
                                                                        ? 'border-red-300'
                                                                        : confirmPassword && password === confirmPassword
                                                                        ? 'border-emerald-300'
                                                                        : 'border-slate-200'
                                                                }`}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowConfirmPassword(prev => !prev)}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                                            >
                                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                            </button>
                                                        </div>
                                                        {confirmPassword && password !== confirmPassword && (
                                                            <p className="text-xs text-red-500 mt-1.5">Passwords do not match</p>
                                                        )}
                                                        {confirmPassword && password === confirmPassword && (
                                                            <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                                                                <CheckCircle size={12} /> Passwords match
                                                            </p>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit"
                                                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all"
                                            >
                                                {resetStep === 1 && "Send Reset Code"}
                                                {resetStep === 2 && "Verify OTP"}
                                                {resetStep === 3 && "Reset Password"}
                                                <ArrowRight size={18} />
                                            </motion.button>
                                        </form>
                                    )}

                                    <div className="mt-6 text-center border-t border-slate-100 pt-5">
                                        <button
                                            onClick={() => {
                                                setIsForgotPassword(false);
                                                setResetStep(1);
                                                setError("");
                                                setSuccess("");
                                                setOtp("");
                                                setPassword("");
                                                setConfirmPassword("");
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
                                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 mb-4">
                                            {isSignUp ? <UserPlus size={28} /> : <Search size={28} />}
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                            {isSignUp ? "Create Account" : "Welcome Back"}
                                        </h2>
                                        <p className="text-slate-500 text-sm">
                                            {isSignUp ? "Join the Campus Lost & Found community" : "Sign in to your account to continue"}
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
                                                        placeholder="Enter your full name"
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
                                                    placeholder={isSignUp ? "yourname@psr.edu.in" : "Enter your college email"}
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
                                                    placeholder={isSignUp ? "Create a password (min 6 chars)" : "Enter your password"}
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
                                                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="Re-enter your password"
                                                        required
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(prev => !prev)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                                    >
                                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
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
