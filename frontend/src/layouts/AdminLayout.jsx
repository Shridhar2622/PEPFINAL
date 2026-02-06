import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Shield, Layout, Wallet, Share2, LogOut, Settings, Wrench, Users, Clock, User as UserIcon, Tag, MessageSquarePlus, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const AdminLayout = () => {
    const { isAdminAuthenticated, logout } = useAdmin();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        if (!isAdminAuthenticated) {
            navigate('/admin/login');
        }
    }, [isAdminAuthenticated, navigate]);

    if (!isAdminAuthenticated) return null;

    const menuItems = [
        { id: 'overview', path: '/admin/dashboard', label: 'Overview', icon: Layout },
        { id: 'features', path: '/admin/toggles', label: 'Toggles', icon: Settings },
        { id: 'services', path: '/admin/services', label: 'Pricing', icon: Wrench },
        { id: 'experts', path: '/admin/experts', label: 'Experts', icon: Users },
        { id: 'bookings', path: '/admin/bookings', label: 'Bookings', icon: Clock },
        { id: 'users', path: '/admin/users', label: 'Users', icon: UserIcon },
        { id: 'reasons', path: '/admin/reasons', label: 'Reasons', icon: Tag },
        { id: 'dealers', path: '/admin/dealers', label: 'Dealers', icon: Users },
        { id: 'feedback', path: '/admin/feedback', label: 'Feedback', icon: MessageSquarePlus },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-outfit">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col gap-6 mb-8">
                    {/* Top Row: Brand & Actions */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white shrink-0">
                                <Shield className="w-6 h-6 md:w-8 md:h-8" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Management Console</h1>
                                <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] md:text-sm mt-1 uppercase tracking-widest">System-wide Configuration</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleTheme}
                                className="p-3 md:p-3.5 bg-white dark:bg-slate-900 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all shadow-sm shrink-0 flex items-center justify-center"
                                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                            <button
                                onClick={async () => {
                                    await logout();
                                    navigate('/admin/login');
                                }}
                                className="p-3 md:p-3.5 bg-white dark:bg-slate-900 text-slate-400 hover:text-red-500 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all shadow-sm shrink-0"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation Row */}
                    <div className="bg-white dark:bg-slate-900 p-1.5 rounded-[2rem] flex border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-x-auto hide-scrollbar w-full">
                        <div className="flex items-center gap-1.5 md:gap-2 min-w-max">
                            {menuItems.map(item => {
                                const isActive = location.pathname === item.path || (location.pathname === '/admin' && item.id === 'overview');
                                return (
                                    <Link
                                        key={item.id}
                                        to={item.path}
                                        className={`px-4 md:px-6 py-2.5 md:py-3 rounded-[1.5rem] text-[10px] md:text-xs font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminLayout;
