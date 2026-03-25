import React, { useState, useEffect } from "react";
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
  Filter,
  X,
  Activity,
  Database,
  Server,
  Clock,
  Wifi
} from "lucide-react";
import PageTransition from "../components/PageTransition";
import toast from "react-hot-toast";
import { useReport } from "../context/ReportContext";
import { useAuth } from "../context/AuthContext";
import ActiveUsersWidget from "../components/ActiveUsersWidget";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("all_reports");
  const { reports, stats: reportStats, deleteReport, updateReportStatus } = useReport();
  const { users, updateUserStatus, deleteUser } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSystemStatus, setShowSystemStatus] = useState(false);
  const [systemInfo, setSystemInfo] = useState(null);
  const navigate = useNavigate();

  // Fetch system status when modal opens
  useEffect(() => {
    if (showSystemStatus) {
      const startTime = Date.now();
      fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => {
          const latency = Date.now() - startTime;
          setSystemInfo({
            serverStatus: res.ok || res.status === 401 ? 'Online' : 'Error',
            latency: `${latency}ms`,
            dbStatus: 'Connected',
            totalUsers: users.length,
            totalReports: reports.length,
            activeReports: reports.filter(r => !['Retrieved', 'Returned', 'Resolved', 'Brought Back'].includes(r.status)).length,
            resolvedReports: reportStats.totalReturned,
            lastChecked: new Date().toLocaleTimeString(),
          });
        })
        .catch(() => {
          setSystemInfo({
            serverStatus: 'Offline',
            latency: 'N/A',
            dbStatus: 'Disconnected',
            totalUsers: users.length,
            totalReports: reports.length,
            activeReports: 0,
            resolvedReports: 0,
            lastChecked: new Date().toLocaleTimeString(),
          });
        });
    }
  }, [showSystemStatus]);

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
      case "history":
        // Sorting history to show most recent first
        return reports.sort((a, b) => new Date(b.date) - new Date(a.date));
      case "all_reports":
      default:
        return reports;
    }
  }, [reports, activeTab]);

  return (
    <>
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
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isSettingsOpen ? 'rotate-180' : ''}`} />
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
                        <button onClick={() => { navigate("/profile"); setIsSettingsOpen(false); }} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg">
                          <User size={16} /> Profile By ID
                        </button>
                        <button
                          onClick={() => { navigate("/notifications"); setIsSettingsOpen(false); }}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg"
                        >
                          <Bell size={16} />
                          <span>Notifications</span>
                        </button>
                        <button
                          onClick={() => { setShowSystemStatus(true); setIsSettingsOpen(false); }}
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
              <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")}>History Archive</TabButton>
              <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")}>User Database</TabButton>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === "history" ? (
                  <motion.div
                    key="history-list"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">System Activity History</h2>
                        <p className="text-sm text-slate-500">Comprehensive log of all lost, found and retrieved items.</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">
                          <Clock size={14} /> Full History
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto -mx-6">
                      <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                          <tr className="bg-slate-50 border-y border-slate-100">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Item Details</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location & Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reported By</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredReports.map((report) => (
                            <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <span className="font-semibold text-slate-900 block">{report.item}</span>
                                <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block uppercase">{report.category || 'General'}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  report.type === 'Lost' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                                }`}>
                                  {report.type}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-slate-600 flex items-center gap-1.5">
                                  <MapPin size={12} className="text-slate-400" /> {report.location}
                                </div>
                                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                  <Calendar size={12} className="text-slate-400" /> {report.date}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-center w-fit ${
                                    ["Retrieved", "Returned", "Resolved", "Brought Back"].includes(report.status)
                                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                                  }`}>
                                    {report.status}
                                  </span>
                                  {report.retrievedBy && (
                                    <span className="text-[10px] text-slate-500">To: {report.retrievedBy}</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                    {report.reportedBy?.charAt(0) || 'U'}
                                  </div>
                                  <span className="text-sm text-slate-600">{report.reportedBy}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => navigate(`/item/${report.id}`)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                                    title="View Record"
                                  >
                                    <Monitor size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(report.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                    title="Delete History Record"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                ) : activeTab !== "users" ? (
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
                              {report.status === "PendingApproval" && (
                                <button
                                  onClick={() => {
                                    if (window.confirm("Approve this report for listing?")) {
                                      updateReportStatus(report.id, "Pending");
                                    }
                                  }}
                                  className="btn btn-ghost text-xs py-1.5 px-3 h-auto text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-medium"
                                  title="Approve for Listing"
                                >
                                  <CheckCircle size={14} className="mr-1 inline" /> Approve
                                </button>
                              )}
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

    {/* System Status Modal */}
    <AnimatePresence>
      {showSystemStatus && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setShowSystemStatus(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Monitor size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">System Status</h3>
                  <p className="text-xs text-slate-500">Real-time health overview</p>
                </div>
              </div>
              <button onClick={() => setShowSystemStatus(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {systemInfo ? (
                <>
                  {/* Overall Status Banner */}
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                    systemInfo.serverStatus === 'Online' 
                      ? 'bg-emerald-50 border border-emerald-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                      systemInfo.serverStatus === 'Online' ? 'bg-emerald-500' : 'bg-red-500'
                    }`} />
                    <span className={`font-semibold text-sm ${
                      systemInfo.serverStatus === 'Online' ? 'text-emerald-700' : 'text-red-700'
                    }`}>
                      {systemInfo.serverStatus === 'Online' ? 'All Systems Operational' : 'System Offline'}
                    </span>
                  </div>

                  {/* Service Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <StatusItem icon={<Server size={16} />} label="Backend Server" value={systemInfo.serverStatus} isGood={systemInfo.serverStatus === 'Online'} />
                    <StatusItem icon={<Database size={16} />} label="MySQL Database" value={systemInfo.dbStatus} isGood={systemInfo.dbStatus === 'Connected'} />
                    <StatusItem icon={<Wifi size={16} />} label="API Latency" value={systemInfo.latency} isGood={true} />
                    <StatusItem icon={<Clock size={16} />} label="Last Checked" value={systemInfo.lastChecked} isGood={true} />
                  </div>

                  {/* Statistics */}
                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Platform Statistics</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <div className="text-lg font-bold text-slate-900">{systemInfo.totalUsers}</div>
                        <div className="text-xs text-slate-500">Registered Users</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <div className="text-lg font-bold text-slate-900">{systemInfo.totalReports}</div>
                        <div className="text-xs text-slate-500">Total Reports</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <div className="text-lg font-bold text-indigo-600">{systemInfo.activeReports}</div>
                        <div className="text-xs text-slate-500">Active Reports</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <div className="text-lg font-bold text-emerald-600">{systemInfo.resolvedReports}</div>
                        <div className="text-xs text-slate-500">Resolved</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full" />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
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

const StatusItem = ({ icon, label, value, isGood }) => (
  <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isGood ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
      {icon}
    </div>
    <div>
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className={`text-sm font-bold ${isGood ? 'text-emerald-600' : 'text-red-600'}`}>{value}</div>
    </div>
  </div>
);

export default AdminDashboard;
