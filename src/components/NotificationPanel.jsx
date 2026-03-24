import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellOff, X } from 'lucide-react';

const NotificationPanel = ({ isOpen, onClose, notifications = [], onClear, onClearAll }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 ring-1 ring-black ring-opacity-5"
                >
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                        {notifications.length > 0 && (
                            <button
                                onClick={onClearAll}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                                <div className="p-4 rounded-full bg-slate-50 text-slate-300 mb-2">
                                    <BellOff size={32} />
                                </div>
                                <p className="text-sm">No new notifications</p>
                            </div>
                        ) : (
                            <ul>
                                {notifications.map((notif) => (
                                    <li key={notif.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors">
                                        <div className="p-4 flex gap-3 relative group">
                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.type === 'LOST' ? 'bg-red-500' :
                                                    notif.type === 'FOUND' ? 'bg-emerald-500' : 'bg-blue-500'
                                                }`} />

                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-slate-800 mb-1 leading-tight">{notif.title}</p>
                                                <p className="text-xs text-slate-500 mb-1">{notif.message}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{notif.time}</p>
                                            </div>

                                            <button
                                                onClick={() => onClear(notif.id)}
                                                className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationPanel;
