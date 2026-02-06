import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Users, PlusCircle, User as UserIcon, Check, X, Phone, Mail, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDealers = () => {
    const { dealers, addDealer, deleteDealer, toggleDealerStatus } = useAdmin();
    const [isAddingDealer, setIsAddingDealer] = React.useState(false);
    const [newDealer, setNewDealer] = React.useState({ name: '', phone: '', email: '', address: '' });
    const [actionLoading, setActionLoading] = React.useState(false);

    const handleAddDealer = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await addDealer(newDealer);
            setIsAddingDealer(false);
            setNewDealer({ name: '', phone: '', email: '', address: '' });
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Authorized Dealers</h3>
                <button
                    onClick={() => setIsAddingDealer(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                    <PlusCircle className="w-4 h-4" /> Add Dealer
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dealers.map((dealer) => (
                    <div key={dealer._id} className="bg-white dark:bg-slate-900 p-6 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-indigo-500/50 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                <UserIcon className="w-6 h-6" />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleDealerStatus(dealer._id)}
                                    className={`p-1.5 rounded-lg transition-colors ${dealer.isActive ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-50'}`}
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => { if (window.confirm('Delete this dealer?')) deleteDealer(dealer._id) }}
                                    className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <h4 className="font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{dealer.name}</h4>
                        <p className="text-xs text-slate-500 font-medium mb-4">{dealer.address}</p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                                <Phone className="w-3 h-3" /> {dealer.phone}
                            </div>
                            {dealer.email && (
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                                    <Mail className="w-3 h-3" /> {dealer.email}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {dealers.length === 0 && (
                <div className="p-12 bg-white dark:bg-slate-900 rounded-4xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">No Dealers Registered</h3>
                </div>
            )}

            {isAddingDealer && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Add New Dealer</h3>
                            <button onClick={() => setIsAddingDealer(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form className="p-8 space-y-4" onSubmit={handleAddDealer}>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Dealer Name</label>
                                <input
                                    required
                                    type="text"
                                    value={newDealer.name}
                                    onChange={(e) => setNewDealer({ ...newDealer, name: e.target.value })}
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-900 dark:text-white transition-all"
                                    placeholder="Enter dealer name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                                    <input
                                        required
                                        type="tel"
                                        value={newDealer.phone}
                                        onChange={(e) => setNewDealer({ ...newDealer, phone: e.target.value })}
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-900 dark:text-white transition-all"
                                        placeholder="9876543210"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email (Optional)</label>
                                    <input
                                        type="email"
                                        value={newDealer.email}
                                        onChange={(e) => setNewDealer({ ...newDealer, email: e.target.value })}
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-900 dark:text-white transition-all"
                                        placeholder="dealer@example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Office Address</label>
                                <textarea
                                    required
                                    value={newDealer.address}
                                    onChange={(e) => setNewDealer({ ...newDealer, address: e.target.value })}
                                    rows={2}
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-900 dark:text-white transition-all"
                                    placeholder="Full address of the dealer"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 rounded-2xl font-black text-sm uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-2"
                            >
                                {actionLoading ? <Loader className="animate-spin" /> : 'Register Dealer'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminDealers;
