import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  TrendingDown,
  Box,
  CheckCircle,
  Bell,
  BellOff,
  User,
  Monitor,
  Search,
  MapPin,
  Calendar,
  Trash2,
  ChevronDown,
  Shield,
  Filter
} from "lucide-react";
import PageTransition from "../components/PageTransition";
import { useReport } from "../context/ReportContext";
import { useAuth } from "../context/AuthContext";
import ActiveUsersWidget from "../components/ActiveUsersWidget";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("all_reports");
  const { reports, stats: reportStats, deleteReport, updateReportStatus } = useReport();
  const { users, updateUserStatus, deleteUser } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const navigate = useNavigate();

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      deleteReport(id);
    }
  };

  const filteredReports = React.useMemo(() => {
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
  }, [reports, activeTab]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 pb-20 pt-10">
        <div className="container-custom">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">Admin Dashboard</h1>
              <p className="text-slate-500 flex items-center gap-2">
                <Shield size={16} /> Overview of system activities
              </p>
            </div>

            <div className="flex items-center gap-4">
              <ActiveUsersWidget />

              <div className="relative">
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    A
                  </div>
                  <span>System</span>
                  <ChevronDown size={14} />
                </button>

                <AnimatePresence>
                  {isSettingsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                    >
                      <div className="p-1">
                        <button onClick={() => navigate("/profile")} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg">
                          <User size={16} /> Profile By ID
                        </button>
                        <button
                          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg"
                        >
                          {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
                          <span>Notifications</span>
                        </button>
                        <button
                          onClick={() => alert("System Status: All systems operational.")}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg"
                        >
                          <Monitor size={16} /> System Status
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard label="Total Users" value={users.length} icon={<Users size={24} />} color="text-indigo-600" bg="bg-indigo-50" />
            <StatCard label="Active Lost" value={reportStats.totalLost} icon={<TrendingDown size={24} />} color="text-red-600" bg="bg-red-50" />
            <StatCard label="Active Found" value={reportStats.totalFound} icon={<Box size={24} />} color="text-emerald-600" bg="bg-emerald-50" />
            <StatCard label="Resolved" value={reportStats.totalReturned} icon={<CheckCircle size={24} />} color="text-blue-600" bg="bg-blue-50" />
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">

            {/* Tabs */}
            <div className="border-b border-slate-200 px-6 pt-6 pb-0 flex flex-nowrap overflow-x-auto gap-4 scrollbar-hide">
              <TabButton active={activeTab === "all_reports"} onClick={() => setActiveTab("all_reports")}>Overview</TabButton>
              <TabButton active={activeTab === "lost"} onClick={() => setActiveTab("lost")}>Lost Reports</TabButton>
              <TabButton active={activeTab === "found"} onClick={() => setActiveTab("found")}>Found Reports</TabButton>
              <TabButton active={activeTab === "retrieved"} onClick={() => setActiveTab("retrieved")}>History</TabButton>
              <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")}>User Database</TabButton>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab !== "users" ? (
                  <motion.div
                    key="reports-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <div className="relative max-w-sm w-full">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search reports..."
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 transition-colors outline-none"
                        />
                      </div>
                      <button onClick={() => navigate("/report-lost")} className="btn btn-primary text-sm py-2 px-4 shadow-none">
                        + New Report
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredReports.map((report) => (
                        <div key={report.id} className="card p-5 group hover:border-indigo-200 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{report.item}</h4>
                            <span className={`badge ${report.type === 'Lost' ? 'badge-lost' : 'badge-found'}`}>
                              {report.type}
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="text-xs text-slate-500 flex items-center gap-1.5">
                              <MapPin size={14} /> {report.location}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5">
                              <Calendar size={14} /> {report.date}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <span className={`text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-500`}>
                              {report.status}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate(`/item/${report.id}`)}
                                className="btn btn-ghost text-xs py-1.5 px-3 h-auto"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDelete(report.id)}
                                className="text-slate-400 hover:text-red-600 transition-colors p-1.5"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="users"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {users.map((user) => (
                        <div key={user.id} className="card p-5 flex flex-row items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 truncate">{user.name}</h4>
                            <div className="text-xs text-slate-500 truncate">{user.email}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{user.role}</span>
                              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${user.status === 'Active' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>{user.status}</span>
                            </div>
                          </div>

                          {user.role !== "Admin" && (
                            <div className="flex gap-2">
                              <button
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${user.status === "Blocked"
                                  ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                  : "border-red-200 text-red-600 hover:bg-red-50"
                                  }`}
                                onClick={() => {
                                  const newStatus = user.status === "Active" ? "Blocked" : "Active";
                                  if (window.confirm(`Confirm change status for ${user.name}?`)) {
                                    updateUserStatus(user.id, newStatus);
                                  }
                                }}
                              >
                                {user.status === "Blocked" ? "Unblock" : "Block"}
                              </button>
                              <button
                                className="text-slate-400 hover:text-red-600 p-1.5 border border-transparent hover:border-red-100 rounded-lg transition-colors"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to PERMANENTLY delete user ${user.name}? This cannot be undone.`)) {
                                    deleteUser(user.id);
                                  }
                                }}
                                title="Delete User"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}

// Sub-components
const StatCard = ({ label, value, icon, color, bg }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</div>
    </div>
  </div>
);

const TabButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`pb-4 px-2 text-sm font-medium transition-colors relative ${active ? "text-indigo-600" : "text-slate-500 hover:text-slate-800"
      }`}
  >
    {children}
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"
      />
    )}
  </button>
);

export default AdminDashboard;
