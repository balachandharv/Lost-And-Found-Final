import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../components/PageTransition";
import BackgroundBubbles from "../components/BackgroundBubbles";
import AdminLogo from "../components/AdminLogo";
import Loader from "../components/Loader";

import { useAuth } from "../context/AuthContext";

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
        <div style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }}>
          <motion.div
            className="glass"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              width: "100%",
              maxWidth: "380px",
              padding: "3rem 2.5rem",
              borderRadius: "1.5rem",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              minHeight: "auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.85)"
            }}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ padding: "2rem 0" }}
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
                  <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <AdminLogo width={50} height={50} />
                    </div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.5px", marginBottom: "0.5rem" }}>Admin Portal</h2>
                    <p style={{ fontSize: "0.875rem", color: "#64748b" }}>Please enter your credentials to continue</p>

                    {/* Mock Credentials Hint */}
                    <div style={{ background: "#eff6ff", padding: "0.75rem", borderRadius: "0.5rem", marginTop: "1rem", border: "1px dashed #bfdbfe", fontSize: "0.8rem", color: "#1e40af", textAlign: "left" }}>
                      <strong>Mock Credentials:</strong><br />
                      ID: admin@college.edu<br />
                      Pass: admin123
                    </div>
                  </div>

                  {/* Admin Authority Option */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/admin-authority")}
                      type="button"
                      style={{
                        width: "100%",
                        padding: "0.875rem",
                        backgroundColor: "#f1f5f9",
                        color: "#334155",
                        border: "1px dashed #cbd5e1",
                        borderRadius: "0.75rem",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem"
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>🛡️</span> Access Admin Authority
                    </motion.button>
                  </div>

                  <form onSubmit={handleLogin} style={{ display: "grid", gap: "1.25rem" }}>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        placeholder="Admin ID"
                        required
                        style={{
                          width: "100%",
                          padding: "1rem",
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "0.75rem",
                          fontSize: "0.95rem",
                          color: "#334155",
                          transition: "all 0.2s"
                        }}
                      />
                    </div>

                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        required
                        style={{
                          width: "100%",
                          padding: "1rem",
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "0.75rem",
                          fontSize: "0.95rem",
                          color: "#334155"
                        }}
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
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#64748b",
                          padding: "4px"
                        }}
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        )}
                      </button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02, translateY: -2 }}
                      whileTap={{ scale: 0.98, translateY: 0 }}
                      style={{
                        width: "100%",
                        padding: "1rem",
                        fontSize: "1rem",
                        marginTop: "0.75rem",
                        backgroundColor: "#0f172a",
                        color: "white",
                        border: "none",
                        borderRadius: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.2)"
                      }}
                    >
                      Sign In
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
