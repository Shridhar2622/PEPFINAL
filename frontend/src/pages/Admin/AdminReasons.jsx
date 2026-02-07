import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Tag, Plus, X, PlusCircle, Loader, Info, HelpCircle, AlertTriangle, Truck, Zap, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const AdminReasons = () => {
    const { reasons, addReason, deleteReason } = useAdmin();
    const [isAddingReason, setIsAddingReason] = React.useState(false);
    const [actionLoading, setActionLoading] = React.useState({});
    const [newReason, setNewReason] = React.useState({ reason: '', type: 'REGULAR' });

    const handleAddReason = async (e) => {
        e.preventDefault();
        if (!newReason.reason) return;
        setActionLoading(prev => ({ ...prev, addReason: true }));
        try {
            await addReason(newReason);
            toast.success("Charge protocol defined");
            setIsAddingReason(false);
            setNewReason({ reason: '', type: 'REGULAR' });
        } catch (err) {
            toast.error("Definition failed");
        } finally {
            setActionLoading(prev => ({ ...prev, addReason: false }));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Retire this charge reason? Past bookings will retain the record, but new ones cannot use it.')) {
            setActionLoading(prev => ({ ...prev, [id]: true }));
            try {
                await deleteReason(id);
                toast.success("Reason retired");
            } catch (err) {
                toast.error("Action denied");
            } finally {
                setActionLoading(prev => ({ ...prev, [id]: false }));
            }
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">Billing Protocols</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Configure standardized reasons for additional job charges</p>
                </div>
                <button
                    onClick={() => setIsAddingReason(true)}
                    className="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                    <Plus className="w-4 h-4" /> Define New Reason
                </button>
            </div>

            {/* Grid of Reasons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                    {reasons.map((r) => (
                        <motion.div
                            layout
                            key={r._id || r.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex items-center justify-between group relative overflow-hidden"
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${r.type === 'TRANSPORT'
                                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
                                        : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20'
                                    }`}>
                                    {r.type === 'TRANSPORT' ? <Truck className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 dark:text-white text-base tracking-tight mb-1">{r.reason}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest ${r.type === 'TRANSPORT' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                                            }`}>
                                            {r.type} CLASS
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDelete(r._id || r.id)}
                                disabled={actionLoading[r._id || r.id]}
                                className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white disabled:opacity-50"
                            >
                                {actionLoading[r._id || r.id] ? <Loader className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {reasons.length === 0 && (
                    <div className="col-span-full py-32 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300 mb-4">
                            <Tag className="w-8 h-8" />
                        </div>
                        <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">Zero Billing Protocols</p>
                        <p className="text-slate-500 text-xs mt-2">No extra charge reasons have been defined in the system.</p>
                    </div>
                )}
            </div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isAddingReason && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddingReason(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden"
                        >
                            <div className="p-10 bg-indigo-600 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tight">New Charge Protocol</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mt-1">Authorized Billing Expansion</p>
                                </div>
                                <button onClick={() => setIsAddingReason(false)} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all"><X /></button>
                            </div>

                            <form onSubmit={handleAddReason} className="p-10 space-y-8">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Info className="w-4 h-4 text-indigo-500" />
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Protocol Description</label>
                                    </div>
                                    <input
                                        required
                                        type="text"
                                        value={newReason.reason}
                                        onChange={e => setNewReason({ ...newReason, reason: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border-none focus:ring-4 ring-indigo-500/10 text-sm font-bold dark:text-white placeholder:text-slate-400 transition-all"
                                        placeholder="e.g. Advanced Material Surcharge"
                                    />
                                    <p className="text-[9px] font-medium text-slate-400 px-1 italic">This description will appear on customer invoices.</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <HelpCircle className="w-4 h-4 text-indigo-500" />
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Protocol Class</label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { id: 'REGULAR', label: 'Regular Job', icon: Zap },
                                            { id: 'TRANSPORT', label: 'Transport', icon: Truck }
                                        ].map(type => (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => setNewReason({ ...newReason, type: type.id })}
                                                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${newReason.type === type.id
                                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                                                        : 'border-slate-100 dark:border-slate-800 bg-transparent text-slate-400'
                                                    }`}
                                            >
                                                <type.icon className="w-6 h-6" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={actionLoading.addReason}
                                        className="flex-1 py-6 bg-indigo-600 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {actionLoading.addReason ? <Loader className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                        Initialize Protocol
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingReason(false)}
                                        className="px-8 py-6 bg-white dark:bg-slate-800 text-slate-400 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-700 transition-all"
                                    >
                                        Abort
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

export default AdminReasons;
