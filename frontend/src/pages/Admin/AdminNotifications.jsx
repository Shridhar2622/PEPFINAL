import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Clock } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { format } from 'date-fns';
import Button from '../../components/common/Button';

const AdminNotifications = () => {
    const { notifications, markAsRead, markAllAsRead, isLoading } = useNotifications();

    if (isLoading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">System Notifications</h1>
                    <p className="text-slate-500 dark:text-slate-400">Alerts and updates for administrators</p>
                </div>
                {notifications.length > 0 && (
                    <Button onClick={markAllAsRead} variant="outline" size="sm" className="gap-2">
                        <Check className="w-4 h-4" /> Mark all read
                    </Button>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No new notifications</h3>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.map((notification) => (
                            <motion.div
                                key={notification._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!notification.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''
                                    }`}
                                onClick={() => !notification.isRead && markAsRead(notification._id)}
                            >
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-2">
                                            <h4 className={`font-bold ${!notification.isRead ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                                                {notification.title}
                                            </h4>
                                            <span className="text-xs text-slate-500 font-mono">
                                                {format(new Date(notification.createdAt), 'MMM d, HH:mm')}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                                            {notification.message}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2" />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminNotifications;
