import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { User as UserIcon, Search, Shield, ShieldAlert, CheckCircle, Ban, Phone, Mail, Clock, Filter, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import client from '../../api/client';

const AdminUsers = () => {
    const { toggleUserStatus } = useAdmin();
    const [users, setUsers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [page, setPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const [actionLoading, setActionLoading] = React.useState({});
    const [searchQuery, setSearchQuery] = React.useState('');
    const [roleFilter, setRoleFilter] = React.useState('ALL'); // 'ALL', 'USER', 'TECHNICIAN', 'ADMIN'

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 10,
                search: searchQuery
            };
            if (roleFilter !== 'ALL') params.role = roleFilter;

            const res = await client.get('/admin/users', { params });
            setUsers(res.data.data.users);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error(err);
            toast.error("Failed to lead identity directory.");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        // Debounce search? For now, direct effect on dependencies.
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [page, roleFilter, searchQuery]);

    const handleToggleStatus = async (user) => {
        const action = user.isActive ? 'BLOCK' : 'ACTIVATE';
        if (window.confirm(`Force ${action} protocol for ${user.name}?`)) {
            const id = user._id || user.id;
            setActionLoading(prev => ({ ...prev, [id]: true }));
            try {
                await toggleUserStatus(id, user.isActive);
                // Refresh list to show updated status
                fetchUsers();
            } catch (err) {
                toast.error("Handshake failed. Try again.");
            } finally {
                setActionLoading(prev => ({ ...prev, [id]: false }));
            }
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Identity Directory</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Audit and manage systemic access for all participants</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative group w-full sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find by name, email..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            className="w-full pl-12 pr-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        />
                    </div>

                    <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl shadow-sm">
                        {['ALL', 'USER', 'TECHNICIAN', 'ADMIN'].map(role => (
                            <button
                                key={role}
                                onClick={() => { setRoleFilter(role); setPage(1); }}
                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${roleFilter === role
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {role === 'ALL' ? 'All' : role}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="col-span-full flex justify-center py-20">
                            <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                    ) : users.map((user) => (
                        <motion.div
                            layout
                            key={user._id || user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between group h-full relative"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-5">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 overflow-hidden ring-4 ring-white dark:ring-slate-950 shadow-inner flex items-center justify-center">
                                            {user.profilePhoto ? (
                                                <img src={user.profilePhoto} className="w-full h-full object-cover" alt={user.name} />
                                            ) : (
                                                <UserIcon className="w-8 h-8 text-slate-300" />
                                            )}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg border-2 border-white dark:border-slate-950 flex items-center justify-center ${user.isActive ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                            {user.isActive ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 dark:text-white text-lg tracking-tight leading-none mb-1.5">{user.name}</h4>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest ${user.role === 'TECHNICIAN'
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                : (user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400')
                                                }`}>
                                                {user.role}
                                            </span>
                                            {!user.isActive && (
                                                <span className="text-[8px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest bg-red-100 text-red-600 animate-pulse">
                                                    Sanctioned
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[10px] font-black text-slate-300 uppercase rotate-12 group-hover:rotate-0 transition-transform">
                                    UDID: {user._id?.substring(18).toUpperCase() || 'MOCK'}
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                    <Mail className="w-4 h-4 opacity-50" />
                                    <span className="text-[11px] font-bold">{user.email || 'No email attached'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                    <Phone className="w-4 h-4 opacity-50" />
                                    <span className="text-[11px] font-bold">{user.phone || '+91 0000 00000'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-6 border-t border-slate-50 dark:border-slate-800/50">
                                {user.role !== 'ADMIN' ? (
                                    <button
                                        disabled={actionLoading[user._id || user.id]}
                                        onClick={() => handleToggleStatus(user)}
                                        className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${user.isActive
                                            ? 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20'
                                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20'
                                            }`}
                                    >
                                        {actionLoading[user._id || user.id] ? (
                                            <Loader className="w-4 h-4 animate-spin" />
                                        ) : (
                                            user.isActive ? <Ban className="w-4 h-4" /> : <Shield className="w-4 h-4" />
                                        )}
                                        {user.isActive ? 'Terminate Access' : 'Restore Privileges'}
                                    </button>
                                ) : (
                                    <div className="flex-1 py-3.5 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                        <ShieldAlert className="w-4 h-4" /> Protected Entity
                                    </div>
                                )}

                                <div className="px-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400">
                                    <Clock className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {!loading && users.length === 0 && (
                    <div className="col-span-full py-32 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300 mb-4">
                            <Search className="w-8 h-8" />
                        </div>
                        <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">Zero Entities Detected</p>
                        <p className="text-slate-500 text-xs mt-2">No users match your current filter parameters.</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-8">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </button>
                    <span className="text-xs font-bold text-slate-500">Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
