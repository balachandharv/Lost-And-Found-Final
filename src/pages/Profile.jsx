import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useReport } from "../context/ReportContext";
import {
    User,
    Settings,
    MapPin,
    Calendar,
    ArrowLeft,
    BarChart2,
    Search,
    Package,
    Mail,
    Phone,
    Camera
} from 'lucide-react';

function Profile() {
    const navigate = useNavigate();
    const { user, updateProfile } = useAuth();
    const { reports } = useReport();
    const [activeTab, setActiveTab] = useState("overview");
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef(null);

    // Form state initialized with user data
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        role: user?.role || "Student",
        phone: user?.phone || "",
        bio: user?.bio || ""
    });

    const myReports = reports.filter(r =>
        (r.reporterId === user?.id) || (r.reporterEmail === user?.email)
    );

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateProfile({ profileImage: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        updateProfile(formData);
        setIsEditing(false);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="card text-center p-10 max-w-sm w-full mx-4">
                    <User size={48} className="mx-auto text-slate-300 mb-4" />
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Please Log In</h2>
                    <p className="text-slate-500 mb-6">You need to be logged in to view your profile.</p>
                    <button onClick={() => navigate("/login")} className="btn btn-primary w-full">Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container-custom max-w-6xl">

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-slate-500 hover:text-indigo-600 font-medium gap-2 mb-8 transition-colors"
                >
                    <ArrowLeft size={18} /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Sidebar: Profile Card */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="card p-0 overflow-hidden">
                            {/* Cover Photo */}
                            <div className="h-32 bg-gradient-to-r from-indigo-500 to-indigo-700"></div>

                            <div className="px-6 pb-6 text-center -mt-12">
                                {/* Profile Image with Upload */}
                                <div className="relative inline-block mb-3">
                                    <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-200 shadow-sm overflow-hidden relative group">
                                        {user.profileImage ? (
                                            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white text-3xl font-bold">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        {/* Camera Overlay */}
                                        <div
                                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            onClick={() => fileInputRef.current.click()}
                                        >
                                            <Camera size={20} className="text-white" />
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>

                                <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                                <p className="text-slate-500 text-sm mb-6">{user.role} • {user.email}</p>

                                <div className="space-y-2">
                                    <button
                                        onClick={() => setActiveTab("overview")}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <BarChart2 size={18} /> Overview
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("settings")}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <Settings size={18} /> Settings & Profile
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Recent Stats Mini Card */}
                        <div className="card p-6">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Impact</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600">Reports Submitted</span>
                                    <span className="font-bold text-slate-900">{myReports.length}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600">Items Found</span>
                                    <span className="font-bold text-emerald-600">{myReports.filter(r => r.type === 'Found').length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="lg:col-span-8">
                        {activeTab === "overview" && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-slate-900">My Activity</h2>

                                <div className="card p-0 overflow-hidden">
                                    {myReports.length > 0 ? (
                                        <div className="divide-y divide-slate-100">
                                            {myReports.map(report => (
                                                <div key={report.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${report.type === 'Lost' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                                                            }`}>
                                                            {report.type === 'Lost' ? <Search size={20} /> : <Package size={20} />}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 text-sm">{report.item}</h4>
                                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                                <Calendar size={12} /> {report.date}
                                                                <span>•</span>
                                                                <span className={report.status === 'Resolved' ? 'text-emerald-600 font-medium' : ''}>{report.status}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => navigate(`/item/${report.id}`)}
                                                        className="btn btn-ghost text-xs px-3 py-1.5 h-auto text-indigo-600"
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center text-slate-400">
                                            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-300">
                                                <Package size={32} />
                                            </div>
                                            <h3 className="text-lg font-medium text-slate-900 mb-1">No reports yet</h3>
                                            <p className="text-sm">Items you report will appear here.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "settings" && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-slate-900">Profile Settings</h2>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                        >
                                            Edit Details
                                        </button>
                                    )}
                                </div>

                                <div className="card p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <div className="form-group">
                                            <label className="form-label">Full Name</label>
                                            <input
                                                type="text"
                                                className={`form-input ${!isEditing ? 'bg-slate-50 border-transparent' : ''}`}
                                                value={formData.name}
                                                readOnly={!isEditing}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Email Address</label>
                                            <input
                                                type="email"
                                                className="form-input bg-slate-50 border-transparent text-slate-500 cursor-not-allowed"
                                                value={formData.email}
                                                readOnly
                                            />
                                        </div>
                                        <div className="md:col-span-2 form-group">
                                            <label className="form-label">Bio / About</label>
                                            <textarea
                                                className={`form-input resize-none ${!isEditing ? 'bg-slate-50 border-transparent' : ''}`}
                                                rows="3"
                                                value={formData.bio}
                                                readOnly={!isEditing}
                                                placeholder="Tell us a bit about yourself..."
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Phone Number</label>
                                            <input
                                                type="tel"
                                                className={`form-input ${!isEditing ? 'bg-slate-50 border-transparent' : ''}`}
                                                value={formData.phone}
                                                readOnly={!isEditing}
                                                placeholder="+1 (555) 000-0000"
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="btn btn-ghost"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                className="btn btn-primary"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="card p-8">
                                    <h3 className="text-lg font-bold text-slate-900 mb-6">Notification Preferences</h3>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-slate-800">Email Notifications</div>
                                            <div className="text-sm text-slate-500">Receive emails about your lost items</div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
