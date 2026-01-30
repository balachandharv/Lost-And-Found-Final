import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import { useReport } from "../context/ReportContext";
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, Users, FileText, Settings, BarChart, ArrowLeft } from 'lucide-react';

function AdminAuthority() {
    const navigate = useNavigate();
    const { reports, updateReportStatus, deleteReport } = useReport();

    const pendingReports = reports.filter(r => r.status === "PendingApproval");

    const handleAccept = (id) => {
        if (window.confirm("Approve this report for public listing?")) {
            updateReportStatus(id, "Pending");
        }
    };

    const handleReject = (id) => {
        if (window.confirm("Reject and delete this report?")) {
            deleteReport(id);
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-slate-50 py-10 px-4">
                <div className="container-custom max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                                    <Shield size={32} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900">
                                        Admin Authority Panel
                                    </h1>
                                    <p className="text-slate-500 mt-1">
                                        Approve user requests and manage system configurations.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Pending Approvals Section */}
                        {pendingReports.length > 0 && (
                            <div className="mb-10">
                                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <AlertTriangle className="text-amber-500" size={24} />
                                    Pending Requests <span className="text-sm font-normal text-slate-500 ml-2">({pendingReports.length} awaiting action)</span>
                                </h2>
                                <div className="space-y-4">
                                    {pendingReports.map(report => (
                                        <motion.div
                                            key={report.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-white p-6 rounded-xl border-l-4 border-amber-500 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                                        >
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-slate-900 mb-1">{report.item}</h3>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mb-2">
                                                    <span>By: <span className="font-semibold text-slate-700">{report.reportedBy}</span></span>
                                                    <span>•</span>
                                                    <span>Loc: {report.location}</span>
                                                    <span>•</span>
                                                    <span>{report.date}</span>
                                                </div>
                                                <p className="text-slate-600 italic bg-slate-50 p-2 rounded text-sm border border-slate-100">
                                                    "{report.description || 'No description provided'}"
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                                <button
                                                    onClick={() => navigate(`/item/${report.id}`)}
                                                    className="btn bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent flex items-center gap-2"
                                                >
                                                    <Eye size={16} /> View
                                                </button>
                                                <button
                                                    onClick={() => handleAccept(report.id)}
                                                    className="btn bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-transparent flex items-center gap-2"
                                                >
                                                    <CheckCircle size={16} /> Accept
                                                </button>
                                                <button
                                                    onClick={() => handleReject(report.id)}
                                                    className="btn bg-red-100 text-red-700 hover:bg-red-200 border-transparent flex items-center gap-2"
                                                >
                                                    <XCircle size={16} /> Reject
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <DashboardCard
                                icon={<Users size={24} />}
                                title="User Management"
                                description="Manage all registered users, roles, and permissions."
                                color="blue"
                            />
                            <DashboardCard
                                icon={<FileText size={24} />}
                                title="System Logs"
                                description="View system access logs, errors, and activity history."
                                color="purple"
                            />
                            <DashboardCard
                                icon={<Settings size={24} />}
                                title="Site Configuration"
                                description="Update global settings, content, and maintenance modes."
                                color="emerald"
                            />
                            <DashboardCard
                                icon={<BarChart size={24} />}
                                title="Reports Overview"
                                description="Detailed analytics involved in lost and found reporting."
                                color="orange"
                            />
                        </div>

                        <div className="mt-10">
                            <button
                                onClick={() => navigate("/admin-login")}
                                className="flex items-center text-slate-500 hover:text-slate-800 font-medium transition-colors"
                            >
                                <ArrowLeft size={18} className="mr-2" /> Back to Admin Login
                            </button>
                        </div>

                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
}

function DashboardCard({ icon, title, description, color }) {
    const colors = {
        blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", iconBg: "bg-blue-100" },
        purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100", iconBg: "bg-purple-100" },
        emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", iconBg: "bg-emerald-100" },
        orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-100", iconBg: "bg-orange-100" },
    };

    const theme = colors[color] || colors.blue;

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full`}
        >
            <div className={`w-12 h-12 rounded-xl ${theme.iconBg} ${theme.text} flex items-center justify-center mb-4`}>
                {icon}
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
                {title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-grow">
                {description}
            </p>
            <div className={`self-start px-3 py-1 rounded-full text-xs font-bold ${theme.bg} ${theme.text} border ${theme.border}`}>
                Authorized Only
            </div>
        </motion.div>
    );
}

export default AdminAuthority;
