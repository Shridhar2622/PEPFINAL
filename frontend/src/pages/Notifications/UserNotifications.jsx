import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, Clock } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { format } from 'date-fns';
import Button from '../../components/common/Button';

const UserNotifications = () => {
    const { notifications, markAsRead, markAllAsRead, isLoading } = useNotifications();

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Notifications</h1>
                    <p className="text-slate-500 dark:text-slate-400">Stay updated with your bookings and offers</p>
                </div>
                {notifications.length > 0 && (
                    <Button onClick={markAllAsRead} variant="outline" size="sm" className="gap-2">
                        <Check className="w-4 h-4" /> Mark all read
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No notifications yet</h3>
                    <p className="text-slate-500 dark:text-slate-400">We'll notify you when something important happens.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <motion.div
                            key={notification._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`relative p-5 rounded-2xl border transition-all ${notification.isRead
                                    ? 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 opacity-75'
                                    : 'bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900/50 shadow-sm'
                                }`}
                            onClick={() => !notification.isRead && markAsRead(notification._id)}
                        >
                            <div className="flex gap-4">
                                <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notification.type === 'BOOKING_CONFIRMED' ? 'bg-green-100 text-green-600' :
                                        notification.type === 'BOOKING_CANCELLED' ? 'bg-red-100 text-red-600' :
                                            'bg-indigo-100 text-indigo-600'
                                    }`}>
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-bold text-lg ${notification.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                                            {notification.title}
                                        </h3>
                                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {notification.message}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <div className="w-3 h-3 bg-indigo-600 rounded-full mt-2 shrink-0 animate-pulse" />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserNotifications;
