import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Check, Package, Search, ArrowLeft, CheckCheck, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    clearAllNotifications
} from '../services/notificationService';

function Notifications() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load notifications
    const loadNotifications = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const notifs = await getNotifications(user.id);
            setNotifications(notifs);
        } catch (error) {
            console.error('Load notifications error:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadNotifications();
    }, [user?.id]);

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(user.id, notification.id);
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
            );
        }

        if (notification.clickAction) {
            navigate(notification.clickAction);
        }
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead(user.id);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleClearAll = async () => {
        await clearAllNotifications(user.id);
        setNotifications([]);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    const getIcon = (type) => {
        switch (type) {
            case 'lost_posted':
                return <Search size={20} className="text-red-500" />;
            case 'found_posted':
                return <Package size={20} className="text-emerald-500" />;
            case 'item_retrieved':
                return <Check size={20} className="text-indigo-500" />;
            case 'report_approved':
                return <CheckCircle size={20} className="text-emerald-500" />;
            case 'report_rejected':
                return <XCircle size={20} className="text-red-500" />;
            default:
                return <Bell size={20} className="text-slate-500" />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'lost_posted': return 'Lost Item';
            case 'found_posted': return 'Found Item';
            case 'item_retrieved': return 'Retrieved';
            case 'report_approved': return 'Approved';
            case 'report_rejected': return 'Rejected';
            default: return 'Update';
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen py-12">
                <div className="container-custom max-w-2xl mx-auto text-center">
                    <Bell size={48} className="mx-auto mb-4 text-slate-300" />
                    <h2 className="text-xl font-bold text-slate-700 mb-2">Please login to view notifications</h2>
                    <Link to="/login" className="text-indigo-600 hover:underline">Go to Login</Link>
                </div>
            </div>
        );
    }

    const unreadNotifications = notifications.filter(n => !n.isRead);
    const readNotifications = notifications.filter(n => n.isRead);

    return (
        <div className="min-h-screen py-12 bg-slate-50">
            <div className="container-custom max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-lg hover:bg-white text-slate-500 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                            <p className="text-sm text-slate-500">
                                {notifications.length} total • {unreadNotifications.length} unread
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {unreadNotifications.length > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                                <CheckCheck size={16} /> Mark all read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} /> Clear all
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-slate-500">Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                        <Bell size={48} className="mx-auto mb-4 text-slate-200" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-1">No notifications</h3>
                        <p className="text-sm text-slate-500">You're all caught up! Check back later for updates.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Unread Section */}
                        {unreadNotifications.length > 0 && (
                            <div>
                                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                                    New ({unreadNotifications.length})
                                </h2>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    {unreadNotifications.map((notification, index) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => handleNotificationClick(notification)}
                                            className="px-4 py-4 border-b border-slate-50 last:border-none cursor-pointer hover:bg-indigo-50/50 bg-indigo-50/30 transition-colors"
                                        >
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">
                                                                {getTypeLabel(notification.type)}
                                                            </span>
                                                            <p className="font-semibold text-slate-900 mt-1">{notification.title}</p>
                                                        </div>
                                                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 mt-2"></span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 mt-1">{notification.body}</p>
                                                    <p className="text-xs text-slate-400 mt-2">{formatTime(notification.createdAt)}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Read Section */}
                        {readNotifications.length > 0 && (
                            <div>
                                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                                    Earlier ({readNotifications.length})
                                </h2>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    {readNotifications.map((notification, index) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() => handleNotificationClick(notification)}
                                            className="px-4 py-4 border-b border-slate-50 last:border-none cursor-pointer hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                        {getTypeLabel(notification.type)}
                                                    </span>
                                                    <p className="font-medium text-slate-700 mt-1">{notification.title}</p>
                                                    <p className="text-sm text-slate-500 mt-1">{notification.body}</p>
                                                    <p className="text-xs text-slate-400 mt-2">{formatTime(notification.createdAt)}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Notifications;
