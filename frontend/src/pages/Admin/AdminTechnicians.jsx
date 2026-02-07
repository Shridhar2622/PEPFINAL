import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Users, Plus, Star, Phone, Mail, X, Check, Loader, Shield, Image as ImageIcon, Search, Filter, Ban, CheckCircle2, MoreVertical, ExternalLink, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import client from '../../api/client';

const AdminTechnicians = () => {
    const { toggleUserStatus, addTechnician, categories, deleteTechnician } = useAdmin();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = React.useState('verified'); // 'verified' or 'pending'
    const [technicians, setTechnicians] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [page, setPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const [selectedCategory, setSelectedCategory] = React.useState('');
    const [isAddingTech, setIsAddingTech] = React.useState(false);
    const [viewingDocsBy, setViewingDocsBy] = React.useState(null);
    const [actionLoading, setActionLoading] = React.useState({});
    const [searchQuery, setSearchQuery] = React.useState('');
    const [newTech, setNewTech] = React.useState({ name: '', email: '', phone: '', bio: '', skills: '' });

    // Approval State
    const [approvalCategories, setApprovalCategories] = React.useState([]);
    const [filterOnline, setFilterOnline] = React.useState('all'); // 'all', 'online', 'offline'

    const fetchTechnicians = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 9,
                status: activeTab === 'pending' ? 'PENDING' : 'VERIFIED',
                // search: searchQuery // Backend search not fully implemented for name?
            };
            if (activeTab === 'verified' && selectedCategory) {
                params.category = selectedCategory;
            }
            if (activeTab === 'verified' && filterOnline !== 'all') {
                params.isOnline = filterOnline === 'online';
            }

            const res = await client.get('/admin/technicians', { params });
            setTechnicians(res.data.data.technicians);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load technicians");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchTechnicians();
    }, [activeTab, page, selectedCategory, filterOnline]);

    const handleAddTech = async (e) => {
        e.preventDefault();
        setActionLoading(prev => ({ ...prev, addTech: true }));
        try {
            await addTechnician(newTech);
            setIsAddingTech(false);
            setNewTech({ name: '', email: '', phone: '', bio: '', skills: '' });
            fetchTechnicians(); // Refresh list
            toast.success("Expert profile created");
        } catch (err) {
            toast.error("Failed to create profile");
        } finally {
            setActionLoading(prev => ({ ...prev, addTech: false }));
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            const newStatus = !currentStatus; // Calculate the desired status
            await toggleUserStatus(userId, newStatus);
            // Fix: Update local state to reflect the change immediately
            setTechnicians(prev => prev.map(t =>
                t.user?._id === userId ? { ...t, user: { ...t.user, isActive: newStatus } } : t
            ));
        } catch (err) {
            // Error handling in context
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleApprove = async (techId) => {
        if (approvalCategories.length === 0) {
            toast.error("Please assign at least one category/skill.");
            return;
        }

        setActionLoading(prev => ({ ...prev, [techId]: true }));
        try {
            await client.patch(`/admin/technicians/${techId}/approve`, { categoryIds: approvalCategories });
            toast.success("Expert verifying & onboarded");
            setViewingDocsBy(null);
            setApprovalCategories([]);
            fetchTechnicians(); // Refresh to remove from pending
        } catch (err) {
            console.error(err);
            toast.error("Verification failed");
        } finally {
            setActionLoading(prev => ({ ...prev, [techId]: false }));
        }
    };

    const handleReject = async (techId) => {
        if (!window.confirm("Reject this expert? They won't be able to provide services.")) return;

        setActionLoading(prev => ({ ...prev, [techId]: true }));
        try {
            await client.patch(`/admin/technicians/${techId}/reject`);
            toast.success("Expert rejected");
            setViewingDocsBy(null);
            fetchTechnicians();
        } catch (err) {
            toast.error("Rejection failed");
        } finally {
            setActionLoading(prev => ({ ...prev, [techId]: false }));
        }
    }

    const toggleApprovalCategory = (catId) => {
        setApprovalCategories(prev =>
            prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
        );
    };

    const StatusBadge = ({ tech }) => {
        const isVerified = tech.documents?.verificationStatus === 'VERIFIED';
        const isBlocked = tech.user?.isActive === false;

        if (isBlocked) return <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[9px] font-black uppercase tracking-widest">Blocked</span>;
        if (isVerified) return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">Verified</span>;
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest">Pending</span>;
    };

    const OnlineBadge = ({ isOnline }) => (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isOnline ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
            {isOnline ? 'Online' : 'Offline'}
        </span>
    );

    // Filter by search locally since backend API might not support complex search yet
    const displayTechnicians = technicians.filter(tech => {
        if (!searchQuery) return true;
        return tech.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tech.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Expert Network</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Verified professionals and partnership management</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search experts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 w-full md:w-64 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setIsAddingTech(true)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> New Expert
                    </button>
                </div>
            </div>

            {/* Tabs & Filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit shadow-sm">
                    {[
                        { id: 'verified', label: 'Verified Partners', icon: CheckCircle2 },
                        { id: 'pending', label: 'Pending Approval', icon: AlertCircle }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setPage(1); }}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Category & Online Filter */}
                {activeTab === 'verified' && (
                    <div className="flex items-center gap-3">
                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={filterOnline}
                                onChange={(e) => { setFilterOnline(e.target.value); setPage(1); }}
                                className="pl-4 pr-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="online">Online Only</option>
                                <option value="offline">Offline Only</option>
                            </select>
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                                className="pl-10 pr-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none cursor-pointer"
                            >
                                <option value="">All Categories</option>
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Experts List (Horizontal Cards) */}
            <div className="flex flex-col gap-4">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                    ) : displayTechnicians.map((tech) => (
                        <motion.div
                            layout
                            key={tech._id || tech.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className={`group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center gap-6 ${!tech.isOnline && activeTab === 'verified' ? 'grayscale opacity-70 hover:grayscale-0 hover:opacity-100' : ''}`}
                        >
                            {/* Avatar & Basic Info */}
                            <div className="flex items-center gap-5 w-full md:w-auto flex-1">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md border-2 border-slate-100 dark:border-slate-800">
                                        <img
                                            src={tech.profilePhoto || tech.user?.profilePhoto || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d'}
                                            className="w-full h-full object-cover"
                                            alt={tech.user?.name}
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1">
                                        <StatusBadge tech={tech} />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">{tech.user?.name || 'Partner'}</h4>
                                        {activeTab === 'verified' && <OnlineBadge isOnline={tech.isOnline} />}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                        <div className="flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {tech.user?.phone || 'No Phone'}
                                        </div>
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <Star className="w-3 h-3 fill-current" />
                                            {tech.avgRating || 0} ({tech.totalJobs || 0} Jobs)
                                        </div>
                                    </div>

                                    {/* Skills/Categories */}
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {(tech.categories && tech.categories.length > 0) ? (
                                            tech.categories.slice(0, 3).map((cat, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md text-[9px] font-black uppercase tracking-widest">
                                                    {cat.name || cat}
                                                </span>
                                            ))
                                        ) : (
                                            tech.skills && tech.skills.slice(0, 3).map((skill, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md text-[9px] font-black uppercase tracking-widest">
                                                    {skill}
                                                </span>
                                            ))
                                        )}
                                        {((tech.categories?.length > 3) || (tech.skills?.length > 3)) && (
                                            <span className="text-[9px] text-slate-400 font-bold self-center">+{Math.max((tech.categories?.length || 0) - 3, (tech.skills?.length || 0) - 3)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions Toolbar */}
                            <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                                <button
                                    onClick={() => setViewingDocsBy(tech)}
                                    className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-white border border-transparent hover:border-indigo-200 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                >
                                    <Shield className="w-3.5 h-3.5" /> Creds
                                </button>

                                {activeTab === 'verified' ? (
                                    <>
                                        <button
                                            disabled={actionLoading[tech.user?._id]}
                                            onClick={() => handleToggleStatus(tech.user?._id, tech.user?.isActive)}
                                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all min-w-[100px] flex items-center justify-center gap-2 ${tech.user?.isActive === false
                                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                                }`}
                                        >
                                            {actionLoading[tech.user?._id] ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                                            {tech.user?.isActive === false ? 'Unblock' : 'Block'}
                                        </button>

                                        <button
                                            onClick={async () => {
                                                if (window.confirm('Are you sure you want to PERMANENTLY delete this technician? This cannot be undone.')) {
                                                    await deleteTechnician(tech._id || tech.id);
                                                    // Fix: Update local state to remove the deleted technician
                                                    setTechnicians(prev => prev.filter(t => (t._id || t.id) !== (tech._id || tech.id)));
                                                }
                                            }}
                                            className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all border border-red-100 hover:border-red-200"
                                            title="Permanently Delete"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                            Pending Review
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm('Are you sure you want to PERMANENTLY delete this application?')) {
                                                    await deleteTechnician(tech._id || tech.id);
                                                    // Fix: Update local state to remove the deleted technician
                                                    setTechnicians(prev => prev.filter(t => (t._id || t.id) !== (tech._id || tech.id)));
                                                }
                                            }}
                                            className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all border border-red-100 hover:border-red-200"
                                            title="Delete Application"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {!loading && displayTechnicians.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-300 mb-6">
                            <Users className="w-10 h-10" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white">Expert Network is Empty</h4>
                        <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2">No professionals found matching your current tab or search filters.</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-8">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </button>
                    <span className="text-xs font-bold text-slate-500">Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>
            )}

            {/* Modernized Verification Modal */}
            <AnimatePresence>
                {viewingDocsBy && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-100 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/10 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl ring-4 ring-indigo-500/20">
                                        <img src={viewingDocsBy.profilePhoto || viewingDocsBy.user?.profilePhoto} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Partnership Verification</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Trust Check: {viewingDocsBy.user?.name}</p>
                                    </div>
                                </div>
                                <button onClick={() => setViewingDocsBy(null)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-400 hover:text-red-500 transition-all"><X /></button>
                            </div>

                            <div className="p-10 space-y-8">
                                {/* Bio & Skills Section */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-2 space-y-2">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Professional Summary</p>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                                            {viewingDocsBy.bio || "No summary provided."}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Self-Reported Skills</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {viewingDocsBy.skills && viewingDocsBy.skills.length > 0 ? (
                                                viewingDocsBy.skills.map((skill, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[10px] font-bold">
                                                        {skill}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">No skills listed</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Aadhar Card / Identity</p>
                                            <a href={viewingDocsBy.documents?.aadharCard} target="_blank" className="text-indigo-500 hover:underline flex items-center gap-1 text-[9px] font-black uppercase"><ExternalLink className="w-3 h-3" /> External View</a>
                                        </div>
                                        <div className="aspect-video rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-slate-800 relative group">
                                            {viewingDocsBy.documents?.aadharCard ? (
                                                <img src={viewingDocsBy.documents.aadharCard} className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2"><ImageIcon className="w-10 h-10" /><span className="text-[10px] font-black uppercase italic">Missing Doc</span></div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">PAN Card / Tax ID</p>
                                            <a href={viewingDocsBy.documents?.panCard} target="_blank" className="text-indigo-500 hover:underline flex items-center gap-1 text-[9px] font-black uppercase"><ExternalLink className="w-3 h-3" /> External View</a>
                                        </div>
                                        <div className="aspect-video rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-slate-800 relative group">
                                            {viewingDocsBy.documents?.panCard ? (
                                                <img src={viewingDocsBy.documents.panCard} className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2"><ImageIcon className="w-10 h-10" /><span className="text-[10px] font-black uppercase italic">Missing Doc</span></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Category Assignment Section */}
                            {viewingDocsBy.documents?.verificationStatus === 'PENDING' && (
                                <div className="px-10 pb-4">
                                    <p className="text-xs font-black uppercase text-slate-900 dark:text-white mb-4">Assign Skills / Categories</p>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat._id || cat.id}
                                                onClick={() => toggleApprovalCategory(cat._id || cat.id)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${approvalCategories.includes(cat._id || cat.id)
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20'
                                                    : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-indigo-500'
                                                    }`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                    {approvalCategories.length === 0 && (
                                        <p className="text-[10px] text-red-500 mt-2 font-bold flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> Please select at least one skill to approve.
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="p-10 bg-slate-50/50 dark:bg-slate-800/50 flex gap-4">
                                {viewingDocsBy.documents?.verificationStatus === 'PENDING' ? (
                                    <>
                                        <button
                                            disabled={actionLoading[viewingDocsBy._id || viewingDocsBy.id] || approvalCategories.length === 0}
                                            onClick={() => handleApprove(viewingDocsBy._id || viewingDocsBy.id)}
                                            className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
                                        >
                                            {actionLoading[viewingDocsBy._id || viewingDocsBy.id] ? <Loader className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                            Onboard Expert
                                        </button>
                                        <button
                                            onClick={() => handleReject(viewingDocsBy._id || viewingDocsBy.id)}
                                            className="px-10 py-5 bg-white dark:bg-slate-800 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-50 transition-all hover:bg-red-50 hover:border-red-100 active:scale-95"
                                        >
                                            Reject
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setViewingDocsBy(null)}
                                        className="w-full py-5 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 transition-all"
                                    >
                                        Close Review
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Registration Overlay */}
            <AnimatePresence>
                {isAddingTech && (
                    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-100 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5"
                        >
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-600 text-white">
                                <h3 className="text-2xl font-black italic tracking-tight">Rapid Onboarding</h3>
                                <button onClick={() => setIsAddingTech(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X /></button>
                            </div>
                            <form className="p-8 space-y-4" onSubmit={handleAddTech}>
                                <div className="space-y-4">
                                    <input required type="text" value={newTech.name} onChange={(e) => setNewTech({ ...newTech, name: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-xs text-slate-900 dark:text-white transition-all shadow-inner" placeholder="Full Professional Name" />
                                    <input required type="email" value={newTech.email} onChange={(e) => setNewTech({ ...newTech, email: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-xs text-slate-900 dark:text-white transition-all shadow-inner" placeholder="Email Contact" />
                                    <input required type="tel" value={newTech.phone} onChange={(e) => setNewTech({ ...newTech, phone: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-xs text-slate-900 dark:text-white transition-all shadow-inner" placeholder="Phone Number" />

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Primary Category</label>
                                        <select
                                            value={newTech.skills}
                                            onChange={(e) => setNewTech({ ...newTech, skills: e.target.value })}
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-xs text-slate-900 dark:text-white transition-all shadow-inner appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Select a Category</option>
                                            {categories.map(cat => (
                                                <option key={cat._id || cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <textarea value={newTech.bio} onChange={(e) => setNewTech({ ...newTech, bio: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-xs text-slate-900 dark:text-white transition-all shadow-inner" placeholder="Brief Professional Summary" rows={3} />
                                </div>
                                <button
                                    type="submit"
                                    disabled={actionLoading.addTech}
                                    className="relative w-full py-5 bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all mt-6 active:scale-95 group overflow-hidden"
                                >
                                    <div className="relative z-10 flex items-center justify-center gap-3">
                                        {actionLoading.addTech ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        Initiate Partnership
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminTechnicians;
