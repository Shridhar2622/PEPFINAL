import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Users, PlusCircle, User as UserIcon, Check, X, Phone, Mail, Loader, MapPin, Search, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const AdminDealers = () => {
    const { dealers, addDealer, deleteDealer, toggleDealerStatus } = useAdmin();
    const [isAddingDealer, setIsAddingDealer] = React.useState(false);
    const [newDealer, setNewDealer] = React.useState({ name: '', phone: '', email: '', address: '' });
    const [actionLoading, setActionLoading] = React.useState({});

    const handleAddDealer = async (e) => {
        e.preventDefault();
        setActionLoading(prev => ({ ...prev, addDealer: true }));
        try {
            await addDealer(newDealer);
            toast.success("Dealer network expanded");
            setIsAddingDealer(false);
            setNewDealer({ name: '', phone: '', email: '', address: '' });
        } catch (err) {
            toast.error("Registration failed");
        } finally {
            setActionLoading(prev => ({ ...prev, addDealer: false }));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Dissolve this dealership agreement?')) {
            setActionLoading(prev => ({ ...prev, [id]: true }));
            try {
                await deleteDealer(id);
                toast.success("Dealer চুক্তি terminated");
            } catch (err) {
                toast.error("Protocol failure");
            } finally {
                setActionLoading(prev => ({ ...prev, [id]: false }));
            }
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Supply Chain Partners</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage authorized material and part distributors</p>
                </div>
                <button
                    onClick={() => setIsAddingDealer(true)}
                    className="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                    <PlusCircle className="w-5 h-5" /> Onboard Global Partner
                </button>
            </div>

            {/* Dealers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {dealers.map((dealer) => (
                        <motion.div
                            layout
                            key={dealer._id || dealer.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none group relative overflow-hidden flex flex-col h-full"
                        >
                            <div className="p-8 pb-4 flex justify-between items-start">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shadow-inner ring-4 ring-white dark:ring-slate-950">
                                    <UserIcon className="w-8 h-8" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        disabled={actionLoading[dealer._id || dealer.id]}
                                        onClick={() => toggleDealerStatus(dealer._id || dealer.id)}
                                        className={`p-3 rounded-2xl transition-all ${dealer.isActive ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-400 bg-slate-50 dark:bg-slate-800'}`}
                                    >
                                        <ShieldCheck className="w-5 h-5" />
                                    </button>
                                    <button
                                        disabled={actionLoading[dealer._id || dealer.id]}
                                        onClick={() => handleDelete(dealer._id || dealer.id)}
                                        className="p-3 text-red-500 bg-red-50 dark:bg-red-950/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                    >
                                        {actionLoading[dealer._id || dealer.id] ? <Loader className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 pt-4 flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-black text-slate-900 dark:text-white text-xl uppercase tracking-tighter leading-none">{dealer.name}</h4>
                                    {dealer.isActive && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
                                </div>

                                <div className="flex items-start gap-3 mt-4 text-slate-500 dark:text-slate-400">
                                    <MapPin className="w-4 h-4 mt-1 shrink-0 opacity-40" />
                                    <p className="text-xs font-medium leading-relaxed uppercase tracking-tight">{dealer.address}</p>
                                </div>

                                <div className="mt-8 space-y-4 pt-6 border-t border-slate-50 dark:border-slate-800/50">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                            <Phone className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">{dealer.phone}</span>
                                    </div>
                                    {dealer.email && (
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                                <Mail className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest lowercase">{dealer.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="px-8 py-3 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                                <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${dealer.isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    {dealer.isActive ? 'Active Node' : 'Suspended'}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {dealers.length === 0 && (
                <div className="p-32 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <Users className="w-10 h-10" />
                    </div>
                    <p className="text-slate-400 font-black uppercase text-sm tracking-[0.3em]">Isolation Detected</p>
                    <p className="text-slate-500 text-xs mt-3">Establish dealer partnerships to optimize material logistics.</p>
                </div>
            )}

            {/* Modal Overlay */}
            <AnimatePresence>
                {isAddingDealer && (
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden"
                        >
                            <div className="p-10 bg-indigo-600 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tight leading-none">Partner Registration</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mt-2">Expansion of Authorized Network</p>
                                </div>
                                <button onClick={() => setIsAddingDealer(false)} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all"><X /></button>
                            </div>

                            <form className="p-10 space-y-6" onSubmit={handleAddDealer}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={newDealer.name}
                                            onChange={(e) => setNewDealer({ ...newDealer, name: e.target.value })}
                                            className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-black text-sm transition-all"
                                            placeholder="Enter registered trade name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Contact</label>
                                        <input
                                            required
                                            type="tel"
                                            value={newDealer.phone}
                                            onChange={(e) => setNewDealer({ ...newDealer, phone: e.target.value })}
                                            className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-black text-sm transition-all"
                                            placeholder="Phone terminal"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Electronic Mail</label>
                                        <input
                                            type="email"
                                            value={newDealer.email}
                                            onChange={(e) => setNewDealer({ ...newDealer, email: e.target.value })}
                                            className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-black text-sm transition-all"
                                            placeholder="partner@network.com"
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Geographic HQ</label>
                                        <textarea
                                            required
                                            value={newDealer.address}
                                            onChange={(e) => setNewDealer({ ...newDealer, address: e.target.value })}
                                            rows={2}
                                            className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-black text-sm transition-all"
                                            placeholder="Full operational address"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={actionLoading.addDealer}
                                        className="flex-1 py-6 bg-indigo-600 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {actionLoading.addDealer ? <Loader className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                        Finalize Partnership
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingDealer(false)}
                                        className="px-8 py-6 bg-white dark:bg-slate-800 text-slate-400 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDealers;
