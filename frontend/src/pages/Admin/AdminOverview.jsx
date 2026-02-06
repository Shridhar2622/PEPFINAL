import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Users, Wrench, Wallet, Shield, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminOverview = () => {
    const { dashboardStats } = useAdmin();
    const navigate = useNavigate();

    const stats = [
        { label: 'Total Users', value: dashboardStats?.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Technicians', value: dashboardStats?.totalTechnicians || 0, icon: Wrench, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Total Revenue', value: `₹${(dashboardStats?.totalRevenue || 0).toLocaleString()}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Pending Docs', value: dashboardStats?.pendingApprovals || 0, icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50' }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</h4>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Sparkles className="w-32 h-32 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Welcome Back, Admin</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md">System is running normally. You have {dashboardStats?.pendingApprovals || 0} technicians waiting for document verification.</p>
                <button
                    onClick={() => navigate('/admin/experts')}
                    className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                    Review Now
                </button>
            </div>
        </div>
    );
};

export default AdminOverview;
