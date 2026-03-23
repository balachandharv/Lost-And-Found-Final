import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, X, Package, Search, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    setupNotifications,
    onForegroundMessage
} from '../services/notificationService';

function NotificationBell() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [permissionAsked, setPermissionAsked] = useState(false);
    const dropdownRef = useRef(null);

    // Load notifications
    const loadNotifications = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const [notifs, count] = await Promise.all([
                getNotifications(user.id),
                getUnreadCount(user.id)
            ]);
            setNotifications(notifs);
            setUnreadCount(count);
        } catch (error) {
            console.error('Load notifications error:', error);
        }
        setLoading(false);
    };

    // Setup push notifications after login
    useEffect(() => {
        if (user?.id && !permissionAsked) {
            // Delay permission request slightly for better UX
            const timer = setTimeout(() => {
                setupNotifications(user.id);
                setPermissionAsked(true);
            }, 3000); // Ask 3 seconds after login

            return () => clearTimeout(timer);
        }
    }, [user?.id, permissionAsked]);

    // Load notifications on mount and when user changes
    useEffect(() => {
        loadNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [user?.id]);

    // Listen for foreground messages
    useEffect(() => {
        if (!user?.id) return;

        const unsubscribe = onForegroundMessage((payload) => {
            // Show browser notification for foreground messages too
            if (Notification.permission === 'granted') {
                new Notification(payload.notification?.title || 'New Notification', {
                    body: payload.notification?.body,
                    icon: payload.notification?.icon || '/logo_icon.png'
                });
            }
            // Refresh notifications list
            loadNotifications();
        });

        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
        };
    }, [user?.id]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(user.id, notification.id);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
            );
        }

        setIsOpen(false);
        if (notification.clickAction) {
            navigate(notification.clickAction);
        }
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead(user.id);
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleClearAll = async () => {
        await clearAllNotifications(user.id);
        setNotifications([]);
        setUnreadCount(0);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    const getIcon = (type) => {
        switch (type) {
            case 'lost_posted':
                return <Search size={16} className="text-red-500" />;
            case 'found_posted':
                return <Package size={16} className="text-emerald-500" />;
            case 'item_retrieved':
                return <Check size={16} className="text-indigo-500" />;
            case 'report_approved':
                return <CheckCircle size={16} className="text-emerald-500" />;
            case 'report_rejected':
                return <XCircle size={16} className="text-red-500" />;
            default:
                return <Bell size={16} className="text-slate-500" />;
        }
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) loadNotifications();
                }}
                className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Notifications"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold text-slate-900">Notifications</h3>
                            <div className="flex items-center gap-2">
                                {notifications.length > 0 && (
                                    <button
                                        onClick={handleClearAll}
                                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                                    >
                                        Clear All
                                    </button>
                                )}
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                                    >
                                        <CheckCheck size={14} /> Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 rounded hover:bg-slate-200 text-slate-400"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {loading && notifications.length === 0 ? (
                                <div className="py-8 text-center text-slate-400">
                                    <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                    Loading...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="py-12 text-center text-slate-400">
                                    <Bell size={32} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`px-4 py-3 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 ${!notification.isRead ? 'bg-indigo-50/50' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm ${!notification.isRead ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                                                        {notification.title}
                                                    </p>
                                                    {!notification.isRead && (
                                                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5"></span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                                                    {notification.body}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    {formatTime(notification.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-center">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate('/notifications');
                                    }}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    View all notifications
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default NotificationBell;
