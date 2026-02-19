import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useUser } from './UserContext';
import client from '../api/client';
import { toast } from 'react-hot-toast';
import { Bell } from 'lucide-react';
import { useSound } from './SoundContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { socket } = useSocket();
    const { user, isAuthenticated } = useUser();
    const { playNotificationSound } = useSound();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch initial notifications
    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        setIsLoading(true);
        try {
            const res = await client.get('/notifications');
            if (res.data.status === 'success') {
                const fetched = res.data.data.notifications;
                setNotifications(fetched);
                setUnreadCount(fetched.filter(n => !n.isRead).length);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Socket Listener
    useEffect(() => {
        if (!socket || !isAuthenticated) return;

        const handleNotification = (newNotification) => {


            // Play Sound
            playNotificationSound();

            // Add to state immediately
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show Toast
            toast.custom((t) => (
                <div
                    className={`${t.visible ? 'animate-enter' : 'animate-leave'
                        } max-w-md w-full bg-white dark:bg-slate-900 shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                >
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                    <Bell className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {newNotification.title}
                                </p>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    {newNotification.message}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ), { duration: 4000 });
        };

        socket.on('notification', handleNotification);

        return () => {
            socket.off('notification', handleNotification);
        };
    }, [socket, isAuthenticated]);

    const markAsRead = async (id) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));

            await client.patch(`/notifications/${id}/read`);
        } catch (err) {
            console.error('Failed to mark notification as read', err);
            // Revert on failure (could implement if needed, but low priority)
        }
    };

    const markAllAsRead = async () => {
        try {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            await client.patch('/notifications/read-all');
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            isLoading,
            markAsRead,
            markAllAsRead,
            fetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
