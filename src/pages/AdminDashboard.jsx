import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../components/PageTransition";
import BackgroundBubbles from "../components/BackgroundBubbles";

import { useReport } from "../context/ReportContext";
import { useAuth } from "../context/AuthContext";

import ActiveUsersWidget from "../components/ActiveUsersWidget";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("all_reports");
  const { reports, stats: reportStats, deleteReport, updateReportStatus } = useReport();
  const { users, updateUserStatus } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const navigate = useNavigate();

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      deleteReport(id);
    }
  };

  const handleAddItem = () => {
    navigate("/report-lost");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  // handleSettings removed in favor of dropdown logic

  const getFilteredReports = () => {
    switch (activeTab) {
      case "lost":
        return reports.filter(r => r.type === "Lost" && !["Retrieved", "Returned", "Resolved", "Brought Back"].includes(r.status));
      case "found":
        return reports.filter(r => r.type === "Found" && !["Retrieved", "Returned", "Resolved", "Brought Back"].includes(r.status));
      case "retrieved":
        return reports.filter(r => ["Retrieved", "Returned", "Resolved", "Brought Back"].includes(r.status));
      case "all_reports":
      default:
        return reports;
    }
  };

  const filteredReports = getFilteredReports();

  return (
    <>
      <BackgroundBubbles />
      <PageTransition>
        <div style={{ padding: "10px 20px 40px 20px", minHeight: "100vh" }}>
          <div className="container">

            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}
            >
              <div>
                <h1 style={{ marginBottom: "0.5rem", color: "var(--text-main)" }}>Admin Dashboard</h1>
                <p style={{ color: "var(--text-muted)" }}>Overview of lost items, found reports, and user activities.</p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                {/* Live Active Users Widget */}
                <ActiveUsersWidget />

                {/* Settings / Profile Dropdown */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="btn-secondary"
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", border: "1px solid var(--border)" }}
                  >
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                      A
                    </div>
                    <span>Settings</span>
                    <span style={{ fontSize: "0.8rem" }}>▼</span>
                  </button>

                  <AnimatePresence>
                    {isSettingsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={{
                          position: "absolute",
                          top: "120%",
                          right: 0,
                          backgroundColor: "white",
                          borderRadius: "1rem",
                          boxShadow: "var(--shadow-lg)",
                          padding: "0.5rem",
                          minWidth: "220px",
                          zIndex: 100,
                          border: "1px solid var(--border)"
                        }}
                      >
                        <div
                          onClick={() => navigate("/profile")}
                          style={{ padding: "0.75rem 1rem", cursor: "pointer", borderRadius: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <span>👤</span> Profile
                        </div>
                        <div
                          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                          style={{ padding: "0.75rem 1rem", cursor: "pointer", borderRadius: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <span>{notificationsEnabled ? "🔔" : "🔕"}</span> Notifications
                        </div>
                        <div
                          onClick={() => alert("System Status: All systems operational.")}
                          style={{ padding: "0.75rem 1rem", cursor: "pointer", borderRadius: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <span>🖥️</span> System Status
                        </div>


                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid - Responsive with minmax */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1.5rem",
                marginBottom: "3rem"
              }}
            >
              <StatCard label="Total Users" value={1250} icon="👥" color="var(--primary)" />
              <StatCard label="Active Lost Reports" value={reportStats.totalLost} icon="📉" color="var(--danger)" />
              <StatCard label="Items Found" value={reportStats.totalFound} icon="📦" color="var(--success)" />
              <StatCard label="Cases Solved" value={reportStats.totalReturned} icon="✅" color="var(--secondary)" />
            </motion.div>

            {/* Main Content Area */}
            <div className="glass" style={{ borderRadius: "1.5rem", padding: "1.5rem", overflow: "hidden" }}>

              {/* Tabs */}
              <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem", overflowX: "auto" }}>
                <TabButton active={activeTab === "all_reports"} onClick={() => setActiveTab("all_reports")}>All Reports</TabButton>
                <TabButton active={activeTab === "lost"} onClick={() => setActiveTab("lost")}>Lost Items</TabButton>
                <TabButton active={activeTab === "found"} onClick={() => setActiveTab("found")}>Found Items</TabButton>
                <TabButton active={activeTab === "retrieved"} onClick={() => setActiveTab("retrieved")}>Retrieved</TabButton>
                <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")}>User Management</TabButton>
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                {activeTab !== "users" ? (
                  <motion.div
                    key="reports-list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                      <h3>
                        {activeTab === 'all_reports' && "Recent Activity"}
                        {activeTab === 'lost' && "Lost Items Reports"}
                        {activeTab === 'found' && "Found Items Reports"}
                        {activeTab === 'retrieved' && "Retrieved History"}
                      </h3>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input type="text" placeholder="Search reports..." style={{ maxWidth: "300px" }} />
                        <button onClick={handleAddItem} className="btn-3d" style={{ backgroundColor: "var(--success)", padding: "0.5rem 1rem" }}>+ Add</button>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                      {filteredReports.map((report) => (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ y: -5, boxShadow: "var(--shadow-lg)" }}
                          style={{
                            backgroundColor: "white",
                            borderRadius: "1rem",
                            border: "1px solid var(--border)",
                            padding: "1.5rem",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                          }}
                        >
                          <div style={{ marginBottom: "1rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                              <h4 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-main)" }}>{report.item}</h4>
                              <span className={`badge ${report.type === 'Lost' ? 'badge-lost' : 'badge-found'}`} style={{ fontSize: "0.75rem" }}>
                                {report.type}
                              </span>
                            </div>
                            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                              📍 {report.location}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                              📅 {report.date} • ID: {report.id}
                            </div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                            <StatusBadge status={report.status} />
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                onClick={() => {
                                  if (report.status === "PendingApproval") {
                                    if (window.confirm("Approve this report for public listing?")) {
                                      updateReportStatus(report.id, "Pending");
                                    }
                                  } else {
                                    navigate(`/item/${report.id}`);
                                  }
                                }}
                                style={{
                                  padding: "0.4rem 0.8rem",
                                  fontSize: "0.85rem",
                                  cursor: "pointer",
                                  background: report.status === "PendingApproval" ? "var(--success)" : "var(--primary)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "0.5rem",
                                  transition: "background 0.2s"
                                }}
                              >
                                {report.status === "PendingApproval" ? "Accept" : "View"}
                              </button>
                              <button
                                onClick={() => handleDelete(report.id)}
                                style={{
                                  padding: "0.4rem 0.8rem",
                                  fontSize: "0.85rem",
                                  cursor: "pointer",
                                  background: "var(--bg-secondary)",
                                  color: "var(--danger)",
                                  border: "1px solid var(--danger)",
                                  borderRadius: "0.5rem",
                                  transition: "all 0.2s"
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = "var(--danger)"; e.currentTarget.style.color = "white"; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = "var(--bg-secondary)"; e.currentTarget.style.color = "var(--danger)"; }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="users"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                      <h3>User Directory</h3>
                      {/* Add User button removed as requested */}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                      {users.map((user) => (
                        <div key={user.id} className="card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                            👤
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0 }}>{user.name}</h4>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{user.email}</div>
                            <div style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
                              <span style={{ fontWeight: 600 }}>{user.role}</span> •
                              <span style={{ color: user.status === "Active" ? "var(--success)" : "var(--danger)", marginLeft: "0.25rem" }}>{user.status}</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            {user.role !== "Admin" && (
                              <button
                                className="btn-secondary"
                                style={{
                                  padding: "0.4rem 0.8rem",
                                  fontSize: "0.75rem",
                                  color: user.status === "Blocked" ? "var(--success)" : "var(--danger)",
                                  borderColor: user.status === "Blocked" ? "var(--success)" : "var(--danger)"
                                }}
                                onClick={() => {
                                  const newStatus = user.status === "Active" ? "Blocked" : "Active";
                                  if (window.confirm(`Are you sure you want to ${newStatus === "Blocked" ? "BLOCK" : "UNBLOCK"} ${user.name}?`)) {
                                    updateUserStatus(user.id, newStatus);
                                  }
                                }}
                              >
                                {user.status === "Blocked" ? "Unblock" : "Block"}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
}

// Sub-components for cleaner code
const StatCard = ({ label, value, icon, color }) => (
  <motion.div
    variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
    className="card"
    style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: `4px solid ${color}` }}
  >
    <div style={{ fontSize: "2.5rem", opacity: 0.8 }}>{icon}</div>
    <div>
      <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-main)" }}>{value}</div>
      <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>{label}</div>
    </div>
  </motion.div>
);

const TabButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: active ? "var(--primary)" : "transparent",
      color: active ? "white" : "var(--text-muted)",
      borderRadius: "2rem",
      padding: "0.5rem 1.5rem",
      whiteSpace: "nowrap"
    }}
  >
    {children}
  </button>
);

const StatusBadge = ({ status }) => {
  const colors = {
    Pending: "#f59e0b",
    Verified: "#10b981",
    Resolved: "#3b82f6"
  };
  return (
    <span style={{ color: colors[status] || "#64748b", fontWeight: 600, fontSize: "0.9rem" }}>
      {status}
    </span>
  );
};

export default AdminDashboard;
