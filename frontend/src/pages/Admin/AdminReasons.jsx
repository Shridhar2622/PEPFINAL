import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Tag, Plus, X, PlusCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

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
            setIsAddingReason(false);
            setNewReason({ reason: '', type: 'REGULAR' });
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(prev => ({ ...prev, addReason: false }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Extra Charge Reasons</h3>
                <button
                    onClick={() => setIsAddingReason(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Reason
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reasons.map((r) => (
                    <div key={r._id || r.id} className="bg-white dark:bg-slate-900 p-5 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${r.type === 'TRANSPORT' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                {r.type === 'TRANSPORT' ? 'T' : 'R'}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white text-sm">{r.reason}</h4>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{r.type} CHARGE</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { if (window.confirm('Delete this reason?')) deleteReason(r._id || r.id) }}
                            className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {reasons.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-xs tracking-widest">
                        No reasons defined
                    </div>
                )}
            </div>

            {isAddingReason && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsAddingReason(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-4xl md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Define New Extra Reason</h3>
                            <button onClick={() => setIsAddingReason(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleAddReason} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Reason Description</label>
                                <input required type="text" value={newReason.reason} onChange={e => setNewReason({ ...newReason, reason: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border-none focus:ring-2 ring-indigo-500/20 text-sm font-bold dark:text-white placeholder:text-slate-400" placeholder="e.g. Spare Parts Replacement" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Type of Charge</label>
                                <select
                                    value={newReason.type}
                                    onChange={e => setNewReason({ ...newReason, type: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border-none focus:ring-2 ring-indigo-500/20 text-sm font-black dark:text-white appearance-none uppercase tracking-widest"
                                >
                                    <option value="REGULAR">REGULAR SERVICE</option>
                                    <option value="TRANSPORT">TRANSPORT CHARGE</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={actionLoading.addReason}
                                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {actionLoading.addReason ? <Loader className="w-5 h-5 animate-spin" /> : <><PlusCircle className="w-5 h-5" /> Submit New Reason</>}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminReasons;
