import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Search, Grid, Zap, Refrigerator, Droplets, Sparkles, ShieldCheck,
    Award, CheckCircle, ChevronRight, X, Filter, LayoutGrid, Heart, Star, Calendar, Clock, MapPin, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/common/Button';
import { useBookings } from '../../context/BookingContext';
import { useUser } from '../../context/UserContext';
import MobileBottomNav from '../../components/mobile/MobileBottomNav';
import BookingModal from '../../components/bookings/BookingModal';
import { useCategories, useServices } from '../../hooks/useServices';

const ServicesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addBooking } = useBookings();
    const { isAuthenticated } = useUser();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(location.state?.category || 'All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBookingItem, setSelectedBookingItem] = useState(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Fetch Categories for Sidebar
    const { data: categoriesRaw = [], isLoading: categoriesLoading } = useCategories();

    // Filter Categories (Sidebar)
    const sidebarCategories = (categoriesRaw || []).filter(c =>
        c.isActive !== false &&
        !c.name.toUpperCase().includes('P2_CAT') &&
        !c.name.toUpperCase().includes('DEBUG')
    ).sort((a, b) => (a.order || 99) - (b.order || 99));

    // Server-side Filtering Params
    const queryParams = {
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        limit: 100 // Fetch reasonably large number for now to fill grid
    };

    // Fetch Services for Grid (Server-side filtered)
    const { data: servicesData, isLoading: servicesLoading } = useServices(queryParams);
    const filteredServices = servicesData?.services || [];

    // Client-side filtering removed as backend now handles it.
    // const getFilteredServices = () => { ... } -> Removed

    // Verify selected category exists
    useEffect(() => {
        if (selectedCategory && selectedCategory !== 'All' && !categoriesLoading && sidebarCategories.length > 0) {
            const exists = sidebarCategories.some(c =>
                c.name.toLowerCase() === selectedCategory.toLowerCase()
            );
            // If category doesn't exist in fetched list, maybe switch to All? 
            // Keeping it for now as it might match a service category even if category list is partial.
        }
    }, [selectedCategory, categoriesLoading, sidebarCategories]);

    const handleBookClick = (service) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const bookingItem = {
            id: service.id || service._id,
            title: service.title,
            price: service.price,
            image: service.headerImage || service.image,
            description: service.description,
            serviceId: service.id || service._id // Ensure ID is passed explicitly if needed
        };

        setSelectedBookingItem(bookingItem);
        setIsModalOpen(true);
    };

    const getCategoryIcon = (name) => {
        if (!name) return <LayoutGrid className="w-5 h-5" />;
        const icons = {
            plumbing: <Droplets className="w-5 h-5" />,
            electrical: <Zap className="w-5 h-5" />,
            cleaning: <Sparkles className="w-5 h-5" />,
            acrepair: <Refrigerator className="w-5 h-5" />,
            pestcontrol: <ShieldCheck className="w-5 h-5" />
        };
        const key = name.toLowerCase().replace(/\s+/g, '');
        return icons[key] || <LayoutGrid className="w-5 h-5" />;
    };

    return (
        <div className="min-h-screen bg-[#FAFAFB] dark:bg-[#080809] transition-colors duration-700 relative overflow-x-hidden">
            {/* Elegant Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[60%] h-[40%] bg-indigo-500/5 dark:bg-indigo-400/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[50%] h-[30%] bg-rose-500/3 dark:bg-rose-400/3 blur-[100px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto flex flex-col lg:flex-row min-h-screen">

                {/* Desktop Discovery Sidebar */}
                <aside className="hidden lg:flex flex-col w-80 border-r border-slate-200/50 dark:border-slate-800/50 p-10 space-y-12 shrink-0">
                    <div className="space-y-2">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Categories</span>
                        <nav className="space-y-1">
                            <button
                                onClick={() => setSelectedCategory('All')}
                                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-500 group ${selectedCategory === 'All' ? 'bg-white dark:bg-white text-slate-900 shadow-2xl scale-[1.02]' : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <Grid className={`w-5 h-5 transition-colors ${selectedCategory === 'All' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    <span className="font-bold text-sm">All Essentials</span>
                                </div>
                                {selectedCategory === 'All' && <ChevronRight className="w-4 h-4 text-indigo-500 animate-pulse" />}
                            </button>

                            {sidebarCategories.map((cat) => (
                                <button
                                    key={cat.id || cat._id}
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-500 group ${selectedCategory === cat.name ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 scale-[1.02]' : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`${selectedCategory === cat.name ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'}`}>
                                            {getCategoryIcon(cat.name)}
                                        </div>
                                        <span className="font-bold text-sm tracking-tight">{cat.name}</span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-all duration-500 ${selectedCategory === cat.name ? 'translate-x-1 opacity-100' : 'opacity-0 -translate-x-2'}`} />
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Experience Area */}
                <main className="flex-1 p-6 md:p-12 lg:p-20">
                    <div className="max-w-6xl mx-auto">
                        {/* Dramatic Header */}
                        <header className="mb-20">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex flex-col lg:flex-row lg:items-end justify-between gap-12"
                            >
                                <div className="space-y-6">
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-emerald-500/20">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        98% Success Rate This Week
                                    </span>
                                    <h1 className="text-6xl md:text-8xl font-[1000] text-slate-900 dark:text-white tracking-[-0.07em] leading-[0.9] italic">
                                        ELEVATED <br />
                                        <span className="text-indigo-600 dark:text-indigo-400 not-italic tracking-[-0.04em] uppercase">Services.</span>
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400 text-xl md:text-2xl font-medium max-w-xl leading-relaxed">
                                        Hand-picked experts for your most demanding home needs. Zero compromise.
                                    </p>
                                </div>

                                <div className="relative group w-full lg:w-[400px]">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-100 transition duration-1000" />
                                    <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 px-8 py-6">
                                        <Search className="w-6 h-6 text-slate-400 mr-4" />
                                        <input
                                            type="text"
                                            placeholder="What do you need today?"
                                            className="bg-transparent border-none outline-none w-full text-slate-900 dark:text-white font-bold placeholder:text-slate-300"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <button
                                            onClick={() => setIsMobileFilterOpen(true)}
                                            className="lg:hidden p-2 rounded-full bg-slate-50 dark:bg-slate-800 ml-auto"
                                        >
                                            <Filter className="w-5 h-5 text-slate-600" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </header>

                        {/* The Grid of Excellence */}
                        <AnimatePresence mode="wait">
                            {servicesLoading ? (
                                <div key="loader" className="flex flex-col items-center justify-center py-40 space-y-6">
                                    <div className="w-16 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ x: '-100%' }}
                                            animate={{ x: '100%' }}
                                            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                                            className="w-1/2 h-full bg-indigo-600"
                                        />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Initializing Catalog</span>
                                </div>
                            ) : filteredServices.length > 0 ? (
                                <motion.div
                                    key="grid"
                                    initial="hidden"
                                    animate="show"
                                    variants={{
                                        show: { transition: { staggerChildren: 0.15 } }
                                    }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-12"
                                >
                                    {filteredServices.map((service) => (
                                        <motion.div
                                            key={service.id || service._id}
                                            variants={{
                                                hidden: { opacity: 0, y: 50 },
                                                show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } }
                                            }}
                                            className="group relative bg-white dark:bg-[#0E0E10] rounded-[3.5rem] p-4 border border-slate-100 dark:border-slate-800 shadow-2xl hover:shadow-indigo-500/10 transition-all duration-700"
                                        >
                                            <div className="aspect-[1.4/1] relative overflow-hidden rounded-[3rem] mb-10">
                                                <img
                                                    src={service.headerImage || service.image || 'default-service.jpg'}
                                                    alt={service.title}
                                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                                                <div className="absolute top-8 left-8 flex flex-col gap-3">
                                                    <div className="px-6 py-3 bg-white/90 dark:bg-black/80 backdrop-blur-xl rounded-full text-[11px] font-[1000] uppercase tracking-widest text-slate-900 dark:text-white shadow-2xl flex items-center gap-3">
                                                        <Award className="w-4 h-4 text-indigo-500" /> Verified
                                                    </div>
                                                </div>

                                                <div className="absolute bottom-8 left-8 right-8">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-[-4deg] group-hover:rotate-0 transition-transform">
                                                            {getCategoryIcon(service.category)}
                                                        </div>
                                                        <h3 className="text-3xl md:text-4xl font-[1000] text-white tracking-tighter uppercase italic line-clamp-2">{service.title}</h3>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="px-8 pb-8 space-y-8">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-bold italic line-clamp-1">
                                                        {service.category || "Premium Service"}
                                                    </p>
                                                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                                                        <Star className={`w-4 h-4 ${service.rating > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                                                        <span className="text-slate-900 dark:text-white font-black text-sm">
                                                            {service.rating > 0 ? service.rating : 'New'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-medium line-clamp-3">
                                                    {service.description || "Premium bespoke service with dedicated project management and post-service warranty."}
                                                </p>

                                                <div className="grid grid-cols-2 gap-y-4">
                                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-tighter">
                                                        <CheckCircle className="w-5 h-5 text-indigo-500" /> Background Checked
                                                    </div>
                                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-tighter">
                                                        <CheckCircle className="w-5 h-5 text-indigo-500" /> ID Verified
                                                    </div>
                                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-tighter">
                                                        <Clock className="w-5 h-5 text-indigo-500" /> On-Time Guarantee
                                                    </div>
                                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-tighter">
                                                        <ShieldCheck className="w-5 h-5 text-indigo-500" /> Insurance Covered
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800">
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] block mb-1">Service Rate</span>
                                                        <span className="text-4xl font-black text-slate-900 dark:text-white">₹{service.price}</span>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => navigate(`/services/${service.id || service._id}`)}
                                                            className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                                                        >
                                                            Details
                                                        </button>
                                                        <button
                                                            onClick={() => handleBookClick(service)}
                                                            className="px-8 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-105 transition-all"
                                                        >
                                                            Book Now
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-40 px-6 text-center bg-white dark:bg-[#0E0E10] rounded-[4rem] border border-dashed border-slate-200 dark:border-slate-800"
                                >
                                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-10 shadow-inner">
                                        <Search className="w-10 h-10 text-slate-200" />
                                    </div>
                                    <h3 className="text-3xl font-[1000] text-slate-900 dark:text-white mb-4 tracking-tighter uppercase italic">Refinement Needed</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-sm text-lg font-medium leading-relaxed">
                                        {selectedCategory !== 'All'
                                            ? `No services found in "${selectedCategory}". Try checking back later or browse other categories.`
                                            : "Our catalog is currently being updated. Please check back soon."}
                                    </p>
                                    <Button
                                        onClick={() => {
                                            setSelectedCategory('All');
                                            setSearchQuery('');
                                        }}
                                        className="px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest hover:shadow-2xl hover:shadow-indigo-600/40 transition-all"
                                    >
                                        Clear Filters
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            {/* Mobile Filter Sheet */}
            <AnimatePresence>
                {isMobileFilterOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileFilterOpen(false)}
                            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] lg:hidden"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0A0A0B] z-[101] rounded-t-[3.5rem] p-10 lg:hidden shadow-[0_-20px_80px_rgba(0,0,0,0.4)]"
                        >
                            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-10" />
                            <div className="flex items-center justify-between mb-12">
                                <h2 className="text-3xl font-[1000] tracking-tighter uppercase italic">Curate <span className="text-indigo-600 not-italic">Catalog.</span></h2>
                                <button onClick={() => setIsMobileFilterOpen(false)} className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[60vh] pb-10 hide-scrollbar">
                                <button
                                    onClick={() => { setSelectedCategory('All'); setIsMobileFilterOpen(false); }}
                                    className={`w-full flex items-center gap-4 px-8 py-6 rounded-3xl font-[1000] text-xs uppercase tracking-widest transition-all ${selectedCategory === 'All' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-50 dark:bg-slate-900 text-slate-500'}`}
                                >
                                    <Grid className="w-5 h-5" /> All Services
                                </button>
                                {sidebarCategories.map(cat => (
                                    <button
                                        key={cat.id || cat._id}
                                        onClick={() => { setSelectedCategory(cat.name); setIsMobileFilterOpen(false); }}
                                        className={`w-full flex items-center justify-between px-8 py-6 rounded-3xl font-[1000] text-xs uppercase tracking-widest transition-all ${selectedCategory === cat.name ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-500'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {getCategoryIcon(cat.name)}
                                            {cat.name}
                                        </div>
                                        <ChevronRight className="w-4 h-4 opacity-40" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <MobileBottomNav />

            {selectedBookingItem && (
                <BookingModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    service={selectedBookingItem}
                    onConfirm={async (data) => {
                        try {
                            return await addBooking(data);
                        } catch (err) {
                            console.error("Booking error:", err);
                            throw err;
                        }
                    }}
                />
            )}
        </div>
    );
};

export default ServicesPage;
