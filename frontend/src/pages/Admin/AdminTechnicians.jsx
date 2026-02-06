import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Users, Plus, Star, Phone, Mail, X, Check, Loader, Shield, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AdminTechnicians = () => {
    const { technicians, setFilteringTech, approveTechnician, rejectTechnician, addTechnician } = useAdmin();
    const navigate = useNavigate();

    const [isAddingTech, setIsAddingTech] = React.useState(false);
    const [viewingDocsBy, setViewingDocsBy] = React.useState(null);
    const [actionLoading, setActionLoading] = React.useState({});
    const [newTech, setNewTech] = React.useState({ name: '', email: '', phone: '', bio: '', skills: '' });

    const handleAddTech = async (e) => {
        e.preventDefault();
        setActionLoading(prev => ({ ...prev, addTech: true }));
        try {
            await addTechnician(newTech);
            setIsAddingTech(false);
            setNewTech({ name: '', email: '', phone: '', bio: '', skills: '' });
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(prev => ({ ...prev, addTech: false }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Professional Network</h3>
                <button
                    onClick={() => setIsAddingTech(true)}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Expert
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {technicians.map((tech) => (
                    <div key={tech._id || tech.id} className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none group relative overflow-hidden">
                        <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-6">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden shadow-md shrink-0 bg-slate-100">
                                <img
                                    src={tech.profilePhoto || tech.user?.profilePhoto || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=100'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=100' }}
                                />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white text-sm md:text-base leading-tight">{tech.user?.name || 'Expert'}</h4>
                                <div className="flex items-center gap-1.5 text-amber-500 text-[10px] font-black uppercase mt-1">
                                    <Star className="w-3.5 h-3.5 fill-current" /> {tech.avgRating || 0} • Partner
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 md:space-y-3 mb-5 md:mb-6">
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                <Phone className="w-4 h-4 text-slate-300 shrink-0" /> <span className="truncate">{tech.user?.phone || 'No Phone'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                <Mail className="w-4 h-4 text-slate-300 shrink-0" /> <span className="truncate">{tech.user?.email || 'No Email'}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-800/50">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Partner</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setFilteringTech(tech);
                                        navigate('/admin/services');
                                    }}
                                    className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase rounded-lg hover:bg-amber-100 transition-colors"
                                >
                                    Services
                                </button>
                                <button
                                    onClick={() => setViewingDocsBy(tech)}
                                    className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                    Docs
                                </button>
                                {tech.documents?.verificationStatus !== 'VERIFIED' && (
                                    <button
                                        disabled={actionLoading[tech._id || tech.id]}
                                        onClick={async () => {
                                            const id = tech._id || tech.id;
                                            setActionLoading(prev => ({ ...prev, [id]: true }));
                                            await approveTechnician(id);
                                            setActionLoading(prev => ({ ...prev, [id]: false }));
                                        }}
                                        className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading[tech._id || tech.id] ? '...' : 'Approve'}
                                    </button>
                                )}
                                {tech.documents?.verificationStatus !== 'REJECTED' && (
                                    <button
                                        disabled={actionLoading[tech._id || tech.id]}
                                        onClick={async () => {
                                            const id = tech._id || tech.id;
                                            if (window.confirm('Reject this technician?')) {
                                                setActionLoading(prev => ({ ...prev, [id]: true }));
                                                await rejectTechnician(id);
                                                setActionLoading(prev => ({ ...prev, [id]: false }));
                                            }
                                        }}
                                        className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading[tech._id || tech.id] ? '...' : 'Reject'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Document Verification Modal */}
            {viewingDocsBy && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Credentials Verification</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Reviewing {viewingDocsBy.user?.name}</p>
                            </div>
                            <button onClick={() => setViewingDocsBy(null)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-400 hover:text-red-500 transition-all"><X /></button>
                        </div>
                        <div className="p-8 grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Identity Document</p>
                                <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 ring-4 ring-slate-50 dark:ring-slate-800/50">
                                    {viewingDocsBy.documents?.idProof ? <img src={viewingDocsBy.documents.idProof} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2"><ImageIcon className="w-10 h-10" /><span className="text-[10px] font-black uppercase">No Document</span></div>}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Certifications / Professional Photo</p>
                                <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 ring-4 ring-slate-50 dark:ring-slate-800/50">
                                    {viewingDocsBy.profilePhoto ? <img src={viewingDocsBy.profilePhoto} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2"><ImageIcon className="w-10 h-10" /><span className="text-[10px] font-black uppercase">No Photo</span></div>}
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-slate-50/50 dark:bg-slate-800/50 flex gap-4">
                            <button
                                disabled={actionLoading[viewingDocsBy._id || viewingDocsBy.id]}
                                onClick={async () => {
                                    const id = viewingDocsBy._id || viewingDocsBy.id;
                                    setActionLoading(prev => ({ ...prev, [id]: true }));
                                    await approveTechnician(id);
                                    setActionLoading(prev => ({ ...prev, [id]: false }));
                                    setViewingDocsBy(null);
                                }}
                                className="flex-1 py-4 bg-green-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-green-500/20 hover:bg-green-700 transition-all disabled:opacity-50"
                            >
                                {actionLoading[viewingDocsBy._id || viewingDocsBy.id] ? 'Processing...' : 'Confirm & Approve'}
                            </button>
                            <button
                                onClick={() => setViewingDocsBy(null)}
                                className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl text-sm font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 transition-all"
                            >
                                Back
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Add Expert Modal */}
            {isAddingTech && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-600 text-white">
                            <h3 className="text-2xl font-black italic">Register Expert</h3>
                            <button onClick={() => setIsAddingTech(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X /></button>
                        </div>
                        <form className="p-8 space-y-4" onSubmit={handleAddTech}>
                            <input required type="text" value={newTech.name} onChange={(e) => setNewTech({ ...newTech, name: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-900 dark:text-white transition-all" placeholder="Full Name" />
                            <input required type="email" value={newTech.email} onChange={(e) => setNewTech({ ...newTech, email: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-900 dark:text-white transition-all" placeholder="Email Address" />
                            <input required type="tel" value={newTech.phone} onChange={(e) => setNewTech({ ...newTech, phone: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-900 dark:text-white transition-all" placeholder="Phone Number" />
                            <input type="text" value={newTech.skills} onChange={(e) => setNewTech({ ...newTech, skills: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-900 dark:text-white transition-all" placeholder="Skills (comma separated)" />
                            <textarea value={newTech.bio} onChange={(e) => setNewTech({ ...newTech, bio: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-900 dark:text-white transition-all" placeholder="Specialist Bio" rows={2} />
                            <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 rounded-2xl font-black text-sm uppercase tracking-widest transition-all mt-4">{actionLoading.addTech ? <Loader className="animate-spin mx-auto" /> : 'Create Expert Profile'}</button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminTechnicians;
