import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Users, Wrench, Wallet, Shield, Sparkles, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Clock, Star, MapPin, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminOverview = () => {
    const { dashboardStats, allBookings, technicians } = useAdmin();
    const navigate = useNavigate();

    const stats = [
        { label: 'System Revenue', value: `₹${(dashboardStats?.totalRevenue || 0).toLocaleString()}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12.5%', isUp: true },
        { label: 'Network Talent', value: dashboardStats?.totalTechnicians || 0, icon: Wrench, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+2', isUp: true },
        { label: 'Active Users', value: dashboardStats?.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+5', isUp: true },
        { label: 'Action Required', value: dashboardStats?.pendingApprovals || 0, icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50', trend: '-1', isUp: false }
    ];

    const recentBookings = (allBookings || []).slice(0, 5);
    const topTechnicians = (technicians || [])
        .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
        .slice(0, 3);

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">Command Center</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Global operational metrics and system health monitoring</p>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Live System Feed
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none hover:border-indigo-500/50 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
                                <stat.icon className="w-7 h-7" />
                            </div>
                            <div className={`flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-lg ${stat.isUp ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.trend}
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-2">{stat.label}</p>
                        <h4 className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{stat.value}</h4>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Recent Transactions</h3>
                        <button onClick={() => navigate('/admin/bookings')} className="text-[10px] font-black uppercase text-indigo-600 tracking-widest hover:underline px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">Historical Data</button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {recentBookings.map((booking, idx) => (
                                <div key={booking._id} className="p-8 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800">
                                            {booking.status === 'COMPLETED' ? <Shield className="w-6 h-6 text-emerald-500" /> : <Clock className="w-6 h-6 text-indigo-500" />}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 dark:text-white text-base leading-tight uppercase tracking-tight">
                                                {booking.category?.name || 'Maintenance Task'}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{booking.customer?.name}</span>
                                                <div className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(booking.scheduledAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900 dark:text-white text-lg tracking-tighter tabular-nums">₹{booking.finalAmount || booking.price}</p>
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md mt-1 inline-block ${booking.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {recentBookings.length === 0 && (
                                <div className="p-20 text-center">
                                    <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">Zero Live Cycles</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Top Experts and Promotion */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white px-2 uppercase tracking-tight italic">Top Performers</h3>
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-8">
                        {topTechnicians.map((tech, idx) => (
                            <div key={tech._id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-5">
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-50 border-2 border-slate-100 dark:border-slate-800 shadow-inner group-hover:scale-105 transition-transform">
                                            <img
                                                src={tech.profilePhoto || tech.user?.profilePhoto || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d'}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center text-[10px] font-black border-4 border-white dark:border-slate-900 shadow-lg leading-none">
                                            {idx + 1}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight leading-none">{tech.user?.name}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="flex text-amber-500">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                            </div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{tech.avgRating || 0} SCORE</span>
                                        </div>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-600 transition-colors" />
                            </div>
                        ))}
                    </div>

                    <div className="bg-indigo-600 p-10 rounded-[3rem] shadow-2xl shadow-indigo-600/40 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform pointer-events-none">
                            <Sparkles className="w-40 h-40 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3 leading-tight uppercase italic tracking-tight">Onboarding Pipeline</h3>
                        <p className="text-white text-xs font-bold leading-relaxed opacity-70 mb-8">
                            Authorize {dashboardStats?.pendingApprovals || 0} pending expert identities to scale your operation.
                        </p>
                        <button
                            onClick={() => navigate('/admin/experts')}
                            className="w-full py-5 bg-white text-indigo-600 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all active:scale-95 shadow-xl shadow-black/10"
                        >
                            Execute Validation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
