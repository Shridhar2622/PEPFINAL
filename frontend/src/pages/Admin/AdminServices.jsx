import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Wrench, FolderPlus, PlusCircle, Search, X, Tag, Sparkles, ChevronRight, Check, Plus, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminServices = () => {
    const {
        services, categories, filteringTech, setFilteringTech,
        updateSubServicePrice, toggleSubService, addCategory, addService
    } = useAdmin();

    const [searchQuery, setSearchQuery] = React.useState('');
    const [isAddingCategory, setIsAddingCategory] = React.useState(false);
    const [isAddingService, setIsAddingService] = React.useState(false);
    const [actionLoading, setActionLoading] = React.useState({});

    const [newCategory, setNewCategory] = React.useState({ name: '', description: '', image: '', icon: 'Hammer', color: 'bg-indigo-100 text-indigo-600' });
    const [newService, setNewService] = React.useState({ title: '', category: '', price: '', image: '', description: '' });

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.name) return;
        setActionLoading(prev => ({ ...prev, addCategory: true }));
        try {
            await addCategory(newCategory);
            setIsAddingCategory(false);
            setNewCategory({ name: '', description: '', image: '', icon: 'Hammer', color: 'bg-indigo-100 text-indigo-600' });
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(prev => ({ ...prev, addCategory: false }));
        }
    };

    const handleAddService = async (e) => {
        e.preventDefault();
        if (!newService.title || !newService.category) return;
        setActionLoading(prev => ({ ...prev, addService: true }));
        try {
            await addService(newService);
            setIsAddingService(false);
            setNewService({ title: '', category: '', price: '', image: '', description: '' });
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(prev => ({ ...prev, addService: false }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
                <div className="p-5 md:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
                    <div>
                        <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight">Service & Plan Management</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Configure offerings and dynamic pricing</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsAddingCategory(true)}
                                className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 md:gap-2 hover:bg-indigo-100 transition-all whitespace-nowrap"
                            >
                                <FolderPlus className="h-4 w-4" /> Category
                            </button>
                            <button
                                onClick={() => setIsAddingService(true)}
                                className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 md:gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all whitespace-nowrap"
                            >
                                <PlusCircle className="h-4 w-4" /> Service Card
                            </button>
                        </div>
                        <div className="relative flex-1 md:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search services..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-48 pl-9 md:pl-10 pr-4 py-2 md:py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs md:text-sm border-none focus:ring-2 ring-indigo-500/20 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {filteringTech && (
                    <div className="mx-5 md:mx-8 mb-4 md:mb-6 p-4 md:p-5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl md:rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden bg-white shadow-sm ring-2 ring-amber-100 shrink-0">
                                <img
                                    src={filteringTech.profilePhoto || filteringTech.user?.profilePhoto || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=100'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=100' }}
                                />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Currently Viewing</p>
                                <h4 className="text-sm md:text-base font-black text-slate-900 dark:text-white mt-0.5">Services by {filteringTech.user?.name || 'Expert'}</h4>
                                <p className="text-[10px] text-amber-600/80 font-bold uppercase mt-0.5">{filteringTech.user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setFilteringTech(null)}
                            className="w-full sm:w-auto px-6 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                            <X className="w-3.5 h-3.5" /> Clear Filter
                        </button>
                    </div>
                )}

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                                <th className="text-left p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Service</th>
                                <th className="text-left p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Activity</th>
                                <th className="text-right p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Pricing (Basic / Premium / Consult)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {services
                                .filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                .filter(s => !filteringTech || String(s.technician) === String(filteringTech._id || filteringTech.id))
                                .map((service) => (
                                    <tr key={service.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="p-6 min-w-50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm shrink-0 bg-slate-100 dark:bg-slate-800">
                                                    <img src={service.image} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?q=80&w=200&auto=format&fit=crop'} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{service.title}</p>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{service.category}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex gap-1.5">
                                                {(service.subServices || []).map(ss => (
                                                    <button
                                                        key={ss.id}
                                                        onClick={() => toggleSubService(service.id, ss.id)}
                                                        title={`Toggle ${ss.name}`}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${ss.isActive
                                                            ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                            }`}
                                                    >
                                                        {ss.id === 'basic' ? <Tag className="w-4 h-4" /> : (ss.id === 'premium' ? <Sparkles className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                {(service.subServices || []).map(ss => (
                                                    <div key={ss.id} className="relative group">
                                                        <span className="absolute -top-3 left-0 text-[7px] font-black text-slate-400 uppercase opacity-0 group-focus-within:opacity-100 transition-opacity">{ss.name}</span>
                                                        <input
                                                            type="number"
                                                            value={ss.price}
                                                            onChange={(e) => updateSubServicePrice(service.id, ss.id, e.target.value)}
                                                            className={`w-20 text-right bg-slate-50 dark:bg-slate-800/50 px-2 py-2 rounded-lg font-black text-xs focus:ring-2 ring-indigo-500/20 outline-none transition-all ${ss.isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 opacity-50'}`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                    {services
                        .filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
                        .filter(s => !filteringTech || String(s.technician) === String(filteringTech._id || filteringTech.id))
                        .map((service) => (
                            <div key={service.id} className="p-5 flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm shrink-0 bg-slate-100 dark:bg-slate-800">
                                        <img src={service.image} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?q=80&w=200&auto=format&fit=crop'} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-slate-900 dark:text-white text-base leading-tight">{service.title}</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{service.category}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    {(service.subServices || []).map(ss => (
                                        <div key={ss.id} className={`flex flex-col gap-2 p-3 rounded-2xl border transition-all ${ss.isActive ? 'bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-[8px] font-black uppercase tracking-tighter ${ss.isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                                                    {ss.name.split(' ')[0]}
                                                </span>
                                                <button
                                                    onClick={() => toggleSubService(service.id, ss.id)}
                                                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${ss.isActive
                                                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                                                        }`}
                                                >
                                                    {ss.isActive ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">₹</span>
                                                <input
                                                    type="number"
                                                    value={ss.price}
                                                    onChange={(e) => updateSubServicePrice(service.id, ss.id, e.target.value)}
                                                    className={`w-full text-right bg-white dark:bg-slate-950 pl-4 pr-1 py-1.5 rounded-lg font-black text-xs outline-none focus:ring-1 ring-indigo-500/20 transition-all ${ss.isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 opacity-50'}`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Modals */}
            {isAddingCategory && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">New Category</h3>
                            <button onClick={() => setIsAddingCategory(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X /></button>
                        </div>
                        <form className="p-8 space-y-4" onSubmit={handleAddCategory}>
                            <input required type="text" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold" placeholder="Category Name" />
                            <textarea required value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold" placeholder="Description" rows={2} />
                            <button className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest">{actionLoading.addCategory ? <Loader className="animate-spin mx-auto" /> : 'Create Category'}</button>
                        </form>
                    </motion.div>
                </div>
            )}

            {isAddingService && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">New Service Card</h3>
                            <button onClick={() => setIsAddingService(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X /></button>
                        </div>
                        <form className="p-8 space-y-4" onSubmit={handleAddService}>
                            <input required type="text" value={newService.title} onChange={(e) => setNewService({ ...newService, title: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold" placeholder="Service Title" />
                            <select required value={newService.category} onChange={(e) => setNewService({ ...newService, category: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold">
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <input required type="number" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold" placeholder="Base Price (₹)" />
                            <button className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest">{actionLoading.addService ? <Loader className="animate-spin mx-auto" /> : 'Create Service'}</button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminServices;
