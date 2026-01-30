import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../components/PageTransition";
import BackgroundBubbles from "../components/BackgroundBubbles";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { Mail, ArrowRight, AlertTriangle, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';

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
                <div className="min-h-screen flex items-center justify-center p-4">
                    <motion.div
                        className="bg-white/90 backdrop-blur-lg border border-white/50 shadow-2xl rounded-3xl w-full max-w-md p-8 md:p-10 relative overflow-hidden"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        {loading ? (
                            <div className="py-12">
                                <Loader text="Verifying..." />
                            </div>
                        ) : (
                            <div>
                                <div className="text-center mb-10">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-6 shadow-sm">
                                        <Mail size={32} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                        Verify Email
                                    </h2>
                                    <p className="text-slate-500 text-sm">
                                        We sent a code to <br />
                                        <span className="font-bold text-slate-900">{email}</span>
                                    </p>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-3 text-center justify-center"
                                    >
                                        <AlertTriangle size={18} /> {error}
                                    </motion.div>
                                )}

                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm flex items-center gap-3 text-center justify-center"
                                    >
                                        <CheckCircle size={18} /> {success}
                                    </motion.div>
                                )}

                                <div className="flex justify-center gap-2 mb-8">
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
                                            className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-slate-200 outline-none bg-slate-50 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
                                        />
                                    ))}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleVerify}
                                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all"
                                >
                                    Verify Code <ArrowRight size={18} />
                                </motion.button>

                                <div className="mt-8 text-center">
                                    <p className="text-sm text-slate-500 mb-4">
                                        Didn't receive the code?{" "}
                                        <button
                                            onClick={handleResend}
                                            disabled={timer > 0}
                                            className={`font-semibold flex items-center justify-center gap-1 mx-auto mt-1 ${timer > 0 ? 'text-slate-400 cursor-default' : 'text-indigo-600 hover:text-indigo-700'
                                                }`}
                                        >
                                            {timer > 0 ? (
                                                <>Resend in {timer}s</>
                                            ) : (
                                                <><RefreshCw size={14} /> Resend Now</>
                                            )}
                                        </button>
                                    </p>

                                    <button
                                        onClick={() => navigate("/login")}
                                        className="text-slate-400 hover:text-slate-600 text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
                                    >
                                        <ArrowLeft size={16} /> Back to Login
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
