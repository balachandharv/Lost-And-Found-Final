import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useReport } from "../context/ReportContext";


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
                // Update profile immediately with the base64 string
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
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800">Please Log In</h2>
                    <button onClick={() => navigate("/login")} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg">Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-8 pb-12">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center text-slate-500 hover:text-blue-600 transition-colors font-medium"
                >
                    <span className="mr-2">←</span> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Sidebar: Profile Card */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            {/* Cover Photo */}
                            <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative"></div>

                            <div className="px-6 pb-6 text-center -mt-12">
                                {/* Profile Image with Upload */}
                                <div className="relative inline-block">
                                    <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-200 shadow-md overflow-hidden relative group">
                                        {user.profileImage ? (
                                            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-3xl font-bold">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        {/* Camera Overlay */}
                                        <div
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-medium"
                                            onClick={() => fileInputRef.current.click()}
                                        >
                                            Change
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

                                <h2 className="mt-3 text-xl font-bold text-slate-900">{user.name}</h2>
                                <p className="text-slate-500 text-sm">{user.role} • {user.email}</p>

                                <div className="mt-6 flex flex-col gap-2">
                                    <button
                                        onClick={() => setActiveTab("overview")}
                                        className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors text-left flex items-center gap-3 ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <span>📊</span> Overview
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("settings")}
                                        className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors text-left flex items-center gap-3 ${activeTab === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <span>⚙️</span> Settings & Profile
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Recent Stats Mini Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Impact</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Reports Submitted</span>
                                    <span className="font-bold text-slate-900">{myReports.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Items Found</span>
                                    <span className="font-bold text-green-600">{myReports.filter(r => r.type === 'Found').length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="lg:col-span-8">
                        {activeTab === "overview" && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-slate-900">My Activity</h2>

                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                    {myReports.length > 0 ? (
                                        <div className="divide-y divide-slate-100">
                                            {myReports.map(report => (
                                                <div key={report.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${report.type === 'Lost' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                            {report.type === 'Lost' ? '🔍' : '📦'}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-slate-800">{report.item}</h4>
                                                            <p className="text-sm text-slate-500">{report.date} • {report.status}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => navigate(`/item/${report.id}`)}
                                                        className="text-sm text-blue-600 font-medium hover:text-blue-800"
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center text-slate-400">
                                            <div className="text-4xl mb-3">📭</div>
                                            <p>You haven't reported any items yet.</p>
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
                                            className="text-blue-600 font-medium hover:text-blue-800"
                                        >
                                            Edit Details
                                        </button>
                                    )}
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                className={`w-full p-3 rounded-lg border ${isEditing ? 'border-slate-300 bg-white' : 'border-transparent bg-slate-50'} transition-all outline-none focus:ring-2 focus:ring-blue-500`}
                                                value={formData.name}
                                                readOnly={!isEditing}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                className="w-full p-3 rounded-lg border border-transparent bg-slate-50 text-slate-500 cursor-not-allowed"
                                                value={formData.email}
                                                readOnly
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Bio / About</label>
                                            <textarea
                                                className={`w-full p-3 rounded-lg border ${isEditing ? 'border-slate-300 bg-white' : 'border-transparent bg-slate-50'} transition-all outline-none focus:ring-2 focus:ring-blue-500`}
                                                rows="3"
                                                value={formData.bio}
                                                readOnly={!isEditing}
                                                placeholder="Tell us a bit about yourself..."
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                                            <input
                                                type="tel"
                                                className={`w-full p-3 rounded-lg border ${isEditing ? 'border-slate-300 bg-white' : 'border-transparent bg-slate-50'} transition-all outline-none focus:ring-2 focus:ring-blue-500`}
                                                value={formData.phone}
                                                readOnly={!isEditing}
                                                placeholder="+1 (555) 000-0000"
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="mt-8 flex justify-end gap-4">
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Notification Preferences</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-slate-800">Email Notifications</div>
                                                <div className="text-sm text-slate-500">Receive emails about your lost items</div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
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
