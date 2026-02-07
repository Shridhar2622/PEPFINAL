import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
    Clock, Tag, User, Users, ExternalLink, X, Info, Edit3,
    Image as ImageIcon, Star, Layout, AlertCircle, Loader,
    CheckCircle2, MessageSquarePlus, Zap, UserCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const AdminBookings = () => {
    const { allBookings, technicians, assignTechnician, cancelBooking, isLoading } = useAdmin();
    const [selectedTechs, setSelectedTechs] = useState({}); // { bookingId: techId }
    const [actionLoading, setActionLoading] = useState({});
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
    const [selectedBooking, setSelectedBooking] = useState(null);

    const activeBookings = allBookings.filter(b => ['PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status));
    const historyBookings = allBookings.filter(b => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.status));

    const filteredBookings = activeTab === 'active' ? activeBookings : historyBookings;

    const handleAssign = async (bookingId) => {
        const techId = selectedTechs[bookingId];
        if (!techId) return toast.error("Please select a technician first");

        setActionLoading(prev => ({ ...prev, [bookingId]: true }));
        try {
            await assignTechnician(bookingId, techId);
            toast.success("Technician assigned successfully");
            // Clear local selection on success
            setSelectedTechs(prev => {
                const next = { ...prev };
                delete next[bookingId];
                return next;
            });
        } catch (err) {
            toast.error("Failed to assign technician");
        } finally {
            setActionLoading(prev => ({ ...prev, [bookingId]: false }));
        }
    };

    const handleCancel = async (bookingId) => {
        if (window.confirm('Force cancel this booking?')) {
            setActionLoading(prev => ({ ...prev, [bookingId]: true }));
            try {
                await cancelBooking(bookingId);
                toast.success("Booking cancelled");
            } catch (err) {
                toast.error("Failed to cancel booking");
            } finally {
                setActionLoading(prev => ({ ...prev, [bookingId]: false }));
            }
        }
    };

    const getFilteredTechnicians = (booking) => {
        const bookingCatId = booking.category?._id || booking.category?.id;
        const bookingCatName = booking.category?.name?.toLowerCase();

        return technicians.filter(t => {
            if (t.documents?.verificationStatus !== 'VERIFIED') return false;
            // Check by Category ID
            if (t.categories?.some(catId => String(catId) === String(bookingCatId))) return true;
            // Fallback: Check by Skills string
            if (t.skills?.some(skill => skill.toLowerCase().includes(bookingCatName))) return true;
            return false;
        });
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            'PENDING': 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
            'ASSIGNED': 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
            'ACCEPTED': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
            'IN_PROGRESS': 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
            'COMPLETED': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
            'CANCELLED': 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
            'REJECTED': 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20',
        };

        return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status] || 'bg-slate-100 text-slate-500'}`}>
                {status}
            </span>
        );
    };

    const DetailRow = ({ label, value, icon: Icon }) => (
        <div className="flex items-start gap-3 py-3 border-b border-indigo-50 dark:border-slate-800 last:border-0">
            {Icon && <Icon className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />}
            <div>
                <p className="text-xs font-bold text-indigo-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{value || 'N/A'}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                                Booking Management
                            </h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Monitor and manage all service requests across the platform
                        </p>
                    </div>

                    <div className="flex items-center bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        {['active', 'history'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all duration-300 uppercase tracking-wider ${activeTab === tab
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                    : 'text-slate-400 hover:text-indigo-600'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table Section */}
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-[400px] flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800"
                        >
                            <Loader className="w-10 h-10 text-indigo-600 animate-spin" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Registry...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                                            <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Service & ID</th>
                                            <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                            <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Technician</th>
                                            <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Revenue</th>
                                            <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredBookings.length > 0 ? (
                                            filteredBookings.map((booking) => (
                                                <tr key={booking._id} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-500/5 transition-colors group">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                                                                <Tag className="w-5 h-5 text-indigo-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-slate-900 dark:text-white text-sm uppercase">
                                                                    {booking.category?.name || 'Service'}
                                                                </p>
                                                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 tracking-tighter uppercase">
                                                                    #{booking._id.slice(-8)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                                                            {booking.customer?.name || 'Guest'}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400">{booking.customer?.phone || booking.customer?.email}</p>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        {booking.technician ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                                    <UserCheck className="w-3 h-3 text-indigo-600" />
                                                                </div>
                                                                <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                                                                    {booking.technician.name}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <select
                                                                    className="text-[10px] font-black p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none flex-1"
                                                                    value={selectedTechs[booking._id] || ""}
                                                                    onChange={(e) => setSelectedTechs(prev => ({ ...prev, [booking._id]: e.target.value }))}
                                                                    disabled={actionLoading[booking._id]}
                                                                >
                                                                    <option value="">Assign Expert</option>
                                                                    {getFilteredTechnicians(booking).map(t => (
                                                                        <option key={t._id} value={t.user?._id || t.user}>{t.name || t.user?.name}</option>
                                                                    ))}
                                                                    <option disabled>──────────</option>
                                                                    {technicians.filter(t => t.documents?.verificationStatus === 'VERIFIED').map(t => (
                                                                        <option key={t._id} value={t.user?._id || t.user}>{t.name || t.user?.name}</option>
                                                                    ))}
                                                                </select>
                                                                {selectedTechs[booking._id] && (
                                                                    <button
                                                                        onClick={() => handleAssign(booking._id)}
                                                                        disabled={actionLoading[booking._id]}
                                                                        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                                                                    >
                                                                        {actionLoading[booking._id] ? (
                                                                            <Loader className="w-3 h-3 animate-spin" />
                                                                        ) : (
                                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <StatusBadge status={booking.status} />
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-slate-900 dark:text-white text-sm">
                                                                ₹{booking.finalAmount || booking.price}
                                                            </span>
                                                            {booking.finalAmount > booking.price && (
                                                                <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">
                                                                    +₹{booking.finalAmount - booking.price} extra
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => setSelectedBooking(booking)}
                                                                className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-indigo-600 hover:text-white rounded-lg transition-all"
                                                                title="View Details"
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                            </button>
                                                            {['PENDING', 'ASSIGNED'].includes(booking.status) && (
                                                                <button
                                                                    onClick={() => handleCancel(booking._id)}
                                                                    className="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
                                                                    title="Cancel Booking"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-3 opacity-20">
                                                        <Layout className="w-12 h-12" />
                                                        <p className="font-black text-sm uppercase tracking-widest">No matching registry found</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Detail Modal Overlay */}
            <AnimatePresence>
                {selectedBooking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-950/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-600 rounded-xl">
                                        <Tag className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                            Job Audit Trace
                                        </h2>
                                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                                            TID-{selectedBooking._id.slice(-8).toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                    <div className="space-y-1">
                                        <DetailRow label="Client" value={selectedBooking.customer?.name} icon={User} />
                                        <DetailRow label="Address" value={selectedBooking.location?.address} icon={Info} />
                                    </div>
                                    <div className="space-y-1">
                                        <DetailRow label="Expert" value={selectedBooking.technician?.name || 'Awaiting Selection'} icon={Users} />
                                        <DetailRow label="Timing" value={new Date(selectedBooking.scheduledAt).toLocaleString()} icon={Clock} />
                                    </div>
                                </div>

                                <div className="bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-500/10 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Status Code</p>
                                        <StatusBadge status={selectedBooking.status} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Final Settlement</p>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">₹{selectedBooking.finalAmount || selectedBooking.price}</p>
                                    </div>
                                </div>

                                {selectedBooking.extraReason && (
                                    <div className="space-y-2">
                                        <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                            <AlertCircle className="w-3.5 h-3.5" /> Billing Exception Reason
                                        </h3>
                                        <p className="p-4 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400 italic">
                                            "{selectedBooking.extraReason}"
                                        </p>
                                    </div>
                                )}

                                {selectedBooking.technicianNote && (
                                    <div className="space-y-2">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Edit3 className="w-3.5 h-3.5" /> Field Technician Notes
                                        </h3>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {selectedBooking.technicianNote}
                                        </div>
                                    </div>
                                )}

                                {selectedBooking.partImages && selectedBooking.partImages.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <ImageIcon className="w-3.5 h-3.5" /> Proof of Completion
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedBooking.partImages.map((img, idx) => (
                                                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                                    <img src={img} className="w-full h-full object-cover" alt="completion proof" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedBooking.review && (
                                    <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> CX Sentiment
                                        </h3>
                                        <div className="p-5 bg-indigo-50/30 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100 dark:border-indigo-500/10">
                                            <div className="flex items-center gap-1 mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3.5 h-3.5 ${i < selectedBooking.review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-200 dark:text-slate-800'}`} />
                                                ))}
                                            </div>
                                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 italic">
                                                "{selectedBooking.review.review || selectedBooking.review.comment}"
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    Reservice Internal Auditor v2.0
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminBookings;
