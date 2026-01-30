import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../components/PageTransition";
import BackgroundBubbles from "../components/BackgroundBubbles";
import AdminLogo from "../components/AdminLogo";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { Shield, Lock, Eye, EyeOff, User, ArrowRight, ShieldCheck } from 'lucide-react';

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      login({ name: "Administrator", role: "Admin", email: "admin@college.edu" });
      navigate("/admin-dashboard");
    }, 2000);
  };

  return (
    <>
      <BackgroundBubbles />
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            className="bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl w-full max-w-sm p-8 md:p-10 relative overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12"
                >
                  <Loader text="Verifying Access..." />
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 text-white mb-6 shadow-xl shadow-slate-200">
                      <ShieldCheck size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Admin Portal</h2>
                    <p className="text-slate-500 text-sm">Authorized personnel only</p>

                    {/* Mock Credentials Hint */}
                    <div className="mt-6 text-left bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs text-blue-800">
                      <p className="font-bold mb-1">Mock Credentials:</p>
                      <p>ID: admin@college.edu</p>
                      <p>Pass: admin123</p>
                    </div>
                  </div>

                  {/* Admin Authority Option */}
                  <div className="mb-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/admin-authority")}
                      type="button"
                      className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all text-sm"
                    >
                      <Shield size={16} /> Access Admin Authority
                    </motion.button>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          placeholder="Admin ID"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all text-sm font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          required
                          className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all text-sm font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02, translateY: -2 }}
                      whileTap={{ scale: 0.98, translateY: 0 }}
                      className="w-full mt-2 py-3.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-lg shadow-slate-300 flex items-center justify-center gap-2 transition-all"
                    >
                      Sign In <ArrowRight size={18} />
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </PageTransition>
    </>
  );
}

export default AdminLogin;
