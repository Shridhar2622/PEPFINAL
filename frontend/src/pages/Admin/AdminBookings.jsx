import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Clock, ImageIcon, MessageSquarePlus, Zap, X, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminBookings = () => {
    const { allBookings, technicians, assignTechnician, cancelBooking } = useAdmin();
    const [actionLoading, setActionLoading] = React.useState({});

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">System Bookings</h3>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Total: {allBookings.length}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="text-left p-5 text-[10px] font-black uppercase text-slate-400">Order</th>
                                <th className="text-left p-5 text-[10px] font-black uppercase text-slate-400">Customer</th>
                                <th className="text-left p-5 text-[10px] font-black uppercase text-slate-400">Expert</th>
                                <th className="text-left p-5 text-[10px] font-black uppercase text-slate-400">Scheduled At</th>
                                <th className="text-left p-5 text-[10px] font-black uppercase text-slate-400">Reason</th>
                                <th className="text-left p-5 text-[10px] font-black uppercase text-slate-400">Total Payout</th>
                                <th className="text-left p-5 text-[10px] font-black uppercase text-slate-400">Status</th>
                                <th className="text-right p-5 text-[10px] font-black uppercase text-slate-400">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {allBookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="p-5">
                                        <p className="font-bold text-xs text-slate-900 dark:text-white">{booking.service?.title || 'Unknown Service'}</p>
                                        <span className="text-[9px] font-black text-slate-400">#{booking._id.substring(0, 8).toUpperCase()}</span>
                                    </td>
                                    <td className="p-5 text-sm font-medium text-slate-600 dark:text-slate-400">{booking.customer?.name}</td>
                                    <td className="p-5 text-sm font-medium text-slate-600 dark:text-slate-400">{booking.technician?.name}</td>
                                    <td className="p-5 text-[10px] font-black text-slate-500 uppercase">
                                        {new Date(booking.scheduledAt).toLocaleDateString()} at {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="p-5 text-sm font-medium text-slate-600 dark:text-slate-400">
                                        {booking.extraReason?.reason || '-'}
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-900 dark:text-white">₹{booking.finalAmount || booking.price}</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {booking.partImages?.map((img, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={img.startsWith('http') ? img : `/uploads/bills/${img}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 p-1 rounded-md transition-all h-6 w-6 flex items-center justify-center"
                                                        title="View Proof"
                                                    >
                                                        <ImageIcon className="w-3.5 h-3.5" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : (booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700')}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {booking.status === 'PENDING' && (
                                                <select
                                                    disabled={actionLoading[booking._id]}
                                                    onChange={async (e) => {
                                                        const techId = e.target.value;
                                                        if (techId) {
                                                            setActionLoading(prev => ({ ...prev, [booking._id]: true }));
                                                            await assignTechnician(booking._id, techId);
                                                            setActionLoading(prev => ({ ...prev, [booking._id]: false }));
                                                        }
                                                    }}
                                                    className="text-[10px] font-bold p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                >
                                                    <option value="">Assign Expert</option>
                                                    {technicians.filter(t => t.documents?.verificationStatus === 'VERIFIED').map(t => (
                                                        <option key={t._id || t.id} value={t._id || t.id}>{t.name || t.user?.name}</option>
                                                    ))}
                                                </select>
                                            )}
                                            {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => {
                                                            const text = `Service assigned: ${booking.service?.title} order #${booking._id.slice(-6)}. Expert ${booking.technician?.name} will contact you shortly.`;
                                                            navigator.clipboard.writeText(text);
                                                            toast.success("Assignment SMS copied");
                                                        }}
                                                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                                                        title="Copy Assignment SMS"
                                                    >
                                                        <MessageSquarePlus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const text = `Happy PIN for your ${booking.service?.title} is ${booking.securityPin}. Please share only after service completion.`;
                                                            navigator.clipboard.writeText(text);
                                                            toast.success("PIN SMS copied");
                                                        }}
                                                        className="p-1.5 text-orange-500 hover:bg-orange-50 rounded"
                                                        title="Copy PIN SMS"
                                                    >
                                                        <Zap className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        disabled={actionLoading[booking._id]}
                                                        onClick={async () => {
                                                            if (window.confirm('Force cancel this booking?')) {
                                                                setActionLoading(prev => ({ ...prev, [booking._id]: true }));
                                                                await cancelBooking(booking._id);
                                                                setActionLoading(prev => ({ ...prev, [booking._id]: false }));
                                                            }
                                                        }}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                                        title="Force Cancel"
                                                    >
                                                        {actionLoading[booking._id] ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {allBookings.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">No bookings found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminBookings;
