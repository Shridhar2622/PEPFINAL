import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Wallet, Share2, Zap, Settings2, ShieldCheck, ToggleRight, LayoutGrid, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminToggles = () => {
    const { appSettings, toggleSetting } = useAdmin();

    const sections = [
        {
            id: 'showWallet',
            label: 'Transaction Engine',
            desc: 'Global toggle for the integrated wallet and credit ledger system.',
            icon: Wallet,
            color: 'bg-indigo-600',
            glow: 'shadow-indigo-500/40'
        },
        {
            id: 'showReferralBanner',
            label: 'Growth Protocol',
            desc: 'Visibility control for systemic referral and multi-level incentives.',
            icon: Share2,
            color: 'bg-emerald-600',
            glow: 'shadow-emerald-500/40'
        },
        {
            id: 'darkThemeForce',
            label: 'Stealth Mode Overlay',
            desc: 'Override client side theme preferences for a standardized dark aesthetic.',
            icon: Sparkles,
            color: 'bg-slate-900',
            glow: 'shadow-slate-500/40'
        },
        {
            id: 'analyticsPublic',
            label: 'Public Insight Node',
            desc: 'Expose high-level performance metrics to system participants.',
            icon: LayoutGrid,
            color: 'bg-purple-600',
            glow: 'shadow-purple-500/40'
        }
    ];

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">System Configuration</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Global feature flags and operational overrides</p>
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Environment</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {sections.map((section) => (
                    <motion.div
                        layout
                        key={section.id}
                        className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none relative group overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className={`w-16 h-16 ${section.color} rounded-[1.5rem] flex items-center justify-center text-white shadow-xl ${section.glow}`}>
                                <section.icon className="w-8 h-8" />
                            </div>
                            <button
                                onClick={() => toggleSetting(section.id)}
                                className={`w-20 h-10 rounded-full relative transition-all duration-500 p-1.5 ${appSettings[section.id] ? 'bg-indigo-600 shadow-lg shadow-indigo-600/30' : 'bg-slate-100 dark:bg-slate-800'}`}
                            >
                                <motion.div
                                    animate={{ x: appSettings[section.id] ? 40 : 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    className="w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center"
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${appSettings[section.id] ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                                </motion.div>
                            </button>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{section.label}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-10 font-medium max-w-[200px] sm:max-w-none">
                                {section.desc}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800/50">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${appSettings[section.id] ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                    <Zap className={`w-3.5 h-3.5 ${appSettings[section.id] ? 'fill-current animate-pulse' : ''}`} />
                                    {appSettings[section.id] ? 'Operational' : 'Deactivated'}
                                </div>
                                <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                                    Flag ID: {section.id}
                                </div>
                            </div>
                        </div>

                        {/* Aesthetic background accent */}
                        <div className={`absolute -bottom-10 -right-10 w-40 h-40 ${section.color} opacity-0 group-hover:opacity-5 blur-[80px] transition-opacity duration-700 pointer-events-none`} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AdminToggles;
