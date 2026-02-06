import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Wallet, Share2, Zap } from 'lucide-react';

const AdminToggles = () => {
    const { appSettings, toggleSetting } = useAdmin();

    const sections = [
        {
            id: 'showWallet',
            label: 'User Wallet System',
            desc: 'Enable/Disable the My Wallet card in user profile',
            icon: Wallet,
            color: 'bg-emerald-500'
        },
        {
            id: 'showReferralBanner',
            label: 'Refer & Earn Program',
            desc: 'Toggle visibility of referral banner on main pages',
            icon: Share2,
            color: 'bg-rose-500'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section) => (
                <div
                    key={section.id}
                    className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-4xl md:rounded-[2.5rem] border border-white dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className={`w-12 h-12 md:w-14 md:h-14 ${section.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                            <section.icon className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                        <button
                            onClick={() => toggleSetting(section.id)}
                            className={`w-14 h-8 md:w-16 md:h-9 rounded-full relative transition-all duration-500 ${appSettings[section.id] ? section.color : 'bg-slate-200 dark:bg-slate-800'}`}
                        >
                            <div className={`absolute top-1 md:top-1.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${appSettings[section.id] ? 'right-1 md:right-1.5' : 'left-1 md:left-1.5'}`} />
                        </button>
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-2">{section.label}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed mb-6 font-medium">{section.desc}</p>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest ${appSettings[section.id] ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <Zap className="w-3 h-3" />
                        {appSettings[section.id] ? 'Active' : 'Disabled'}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminToggles;
