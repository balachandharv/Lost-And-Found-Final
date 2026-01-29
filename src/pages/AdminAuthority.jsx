import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";

import { useReport } from "../context/ReportContext";

function AdminAuthority() {
    const navigate = useNavigate();
    const { reports, updateReportStatus, deleteReport } = useReport();

    const pendingReports = reports.filter(r => r.status === "PendingApproval");

    const handleAccept = (id) => {
        if (window.confirm("Approve this report for public listing?")) {
            updateReportStatus(id, "Pending"); // Changes to active "Pending" state (visible in feed)
        }
    };

    const handleReject = (id) => {
        if (window.confirm("Reject and delete this report?")) {
            deleteReport(id);
        }
    };

    return (
        <PageTransition>
            <div style={{ padding: "80px 2rem 2rem 2rem", maxWidth: "1200px", margin: "0 auto", minHeight: "100vh", background: "linear-gradient(to bottom right, #f8fafc, #e2e8f0)" }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div style={{
                        marginBottom: "2rem",
                        background: "rgba(255, 255, 255, 0.9)",
                        padding: "2rem",
                        borderRadius: "1rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                    }}>
                        <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1e293b", marginBottom: "1rem" }}>
                            Admin Authority Panel
                        </h1>
                        <p style={{ color: "#64748b" }}>
                            Approve user requests and manage system configurations.
                        </p>
                    </div>

                    {/* Pending Approvals Section */}
                    {pendingReports.length > 0 && (
                        <div style={{ marginBottom: "3rem" }}>
                            <h2 style={{ color: "var(--danger)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                ⚠️ Pending One Requests ({pendingReports.length})
                            </h2>
                            <div style={{ display: "grid", gap: "1rem" }}>
                                {pendingReports.map(report => (
                                    <motion.div
                                        key={report.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        style={{
                                            background: "white",
                                            padding: "1.5rem",
                                            borderRadius: "0.75rem",
                                            borderLeft: "4px solid var(--danger)",
                                            boxShadow: "var(--shadow-sm)",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            flexWrap: "wrap",
                                            gap: "1rem"
                                        }}
                                    >
                                        <div>
                                            <h3 style={{ margin: "0 0 0.25rem 0" }}>{report.item}</h3>
                                            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                                Reported by: <strong>{report.reportedBy}</strong> • Location: {report.location} • Date: {report.date}
                                            </p>
                                            <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}><em>"{report.description || 'No description provided'}"</em></p>
                                        </div>
                                        <div style={{ display: "flex", gap: "1rem" }}>
                                            <button
                                                onClick={() => navigate(`/item/${report.id}`)}
                                                style={{
                                                    background: "var(--primary)",
                                                    color: "white",
                                                    border: "none",
                                                    padding: "0.5rem 1.5rem",
                                                    borderRadius: "0.5rem",
                                                    cursor: "pointer",
                                                    fontWeight: 600
                                                }}
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleAccept(report.id)}
                                                style={{
                                                    background: "var(--success)",
                                                    color: "white",
                                                    border: "none",
                                                    padding: "0.5rem 1.5rem",
                                                    borderRadius: "0.5rem",
                                                    cursor: "pointer",
                                                    fontWeight: 600
                                                }}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleReject(report.id)}
                                                style={{
                                                    background: "var(--danger)",
                                                    color: "white",
                                                    border: "none",
                                                    padding: "0.5rem 1.5rem",
                                                    borderRadius: "0.5rem",
                                                    cursor: "pointer",
                                                    fontWeight: 600
                                                }}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>

                        {/* Card 1: User Management */}
                        <DashboardCard
                            title="User Management"
                            description="Manage all registered users, roles, and permissions."
                            color="blue"
                        />

                        {/* Card 2: System Logs */}
                        <DashboardCard
                            title="System Logs"
                            description="View system access logs, errors, and activity history."
                            color="purple"
                        />

                        {/* Card 3: Site Configuration */}
                        <DashboardCard
                            title="Site Configuration"
                            description="Update global settings, content, and maintenance modes."
                            color="emerald"
                        />
                        {/* Card 4: Reports Overview */}
                        <DashboardCard
                            title="Reports Overview"
                            description="Detailed analytics involved in lost and found reporting."
                            color="orange"
                        />
                    </div>

                    <div style={{ marginTop: "2rem" }}>
                        <button
                            onClick={() => navigate("/admin-login")}
                            style={{
                                padding: "0.75rem 1.5rem",
                                backgroundColor: "#cbd5e1",
                                color: "#334155",
                                border: "none",
                                borderRadius: "0.5rem",
                                cursor: "pointer",
                                fontWeight: "600"
                            }}
                        >
                            Back to Admin Login
                        </button>
                    </div>

                </motion.div>
            </div>
        </PageTransition>
    );
}

function DashboardCard({ title, description, color }) {
    const colors = {
        blue: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
        purple: { bg: "#f3e8ff", text: "#6b21a8", border: "#d8b4fe" },
        emerald: { bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0" },
        orange: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
    };

    const theme = colors[color] || colors.blue;

    return (
        <motion.div
            whileHover={{ y: -5 }}
            style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "1rem",
                border: `1px solid ${theme.border}`,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
            }}
        >
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", marginBottom: "0.5rem" }}>
                {title}
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: "1.5" }}>
                {description} This section is restricted to administrators.
            </p>
            <div style={{
                marginTop: "1rem",
                display: "inline-block",
                padding: "0.25rem 0.75rem",
                background: theme.bg,
                color: theme.text,
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: "600"
            }}>
                Authorized Only
            </div>
        </motion.div>
    );
}

export default AdminAuthority;
