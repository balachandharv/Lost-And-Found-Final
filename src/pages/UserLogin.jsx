import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../components/PageTransition";
import BackgroundBubbles from "../components/BackgroundBubbles";
import Loader from "../components/Loader";

function UserLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigate("/user-dashboard");
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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "2.5rem",
              borderRadius: "1.5rem",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
              minHeight: "500px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader text="Verifying Credentials..." />
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{
                      width: "80px",
                      height: "80px",
                      backgroundColor: "rgba(37, 99, 235, 0.1)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1rem auto",
                      color: "var(--primary)"
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                    </div>
                    <h2 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Student Login</h2>
                    <p style={{ color: "var(--text-muted)", margin: 0 }}>Welcome back! Please login to your account.</p>

                    {/* Mock Credentials Hint */}
                    <div style={{ background: "#f0fdf4", padding: "0.75rem", borderRadius: "0.5rem", marginTop: "1rem", border: "1px dashed #bbf7d0", fontSize: "0.8rem", color: "#166534", textAlign: "left" }}>
                      <strong>Mock Credentials:</strong><br />
                      ID: student@college.edu<br />
                      Pass: student123
                    </div>
                  </div>

                  <form onSubmit={handleLogin} style={{ display: "grid", gap: "1.5rem" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Register Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 23IT008"
                        required
                        style={{ backgroundColor: "rgba(255,255,255,0.8)" }}
                      />
                    </div>

                    <div style={{ position: "relative" }}>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        required
                        style={{ backgroundColor: "rgba(255,255,255,0.8)", width: "100%", padding: "0.875rem" }} // ensuring consistent styling
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "65%", // adjusted for label height
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
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-3d"
                      style={{
                        width: "100%",
                        padding: "0.875rem",
                        fontSize: "1rem",
                        marginTop: "0.5rem"
                      }}
                    >
                      Login
                    </motion.button>
                  </form>

                  <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                    <a href="#" style={{ color: "var(--primary)", fontSize: "0.875rem", textDecoration: "underline" }}>Forgot Password?</a>
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

export default UserLogin;
