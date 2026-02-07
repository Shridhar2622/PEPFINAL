import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Search, Grid, Zap, Refrigerator, Droplets, Sparkles, ShieldCheck,
    Award, CheckCircle, ChevronRight, X, Filter, LayoutGrid, Heart, Star, Clock, MapPin
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

    // -- Data Fetching First --
    const { data: categoriesRaw = [], isLoading: categoriesLoading } = useCategories();

    // Filter out internal/debug categories
    const sidebarCategories = (categoriesRaw || []).filter(c =>
        c.isActive !== false &&
        !c.name.toUpperCase().includes('P2_CAT') &&
        !c.name.toUpperCase().includes('DEBUG')
    ).sort((a, b) => (a.order || 99) - (b.order || 99));

    // -- State --
    const [searchQuery, setSearchQuery] = useState('');
    // Use ID for state, defaulting to 'All'
    const [selectedCategoryId, setSelectedCategoryId] = useState(location.state?.categoryId || location.state?.category || 'All');

    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Helpers to get Category Name
    const getCategoryName = (id) => {
        if (id === 'All') return 'All Services';
        const cat = sidebarCategories.find(c => c._id === id || c.id === id);
        return cat ? cat.name : 'Services';
    };

    // Prepare Query Params for Services
    const serviceParams = {
        category: selectedCategoryId === 'All' ? undefined : selectedCategoryId,
        search: searchQuery || undefined,
        limit: 100 // Fetch enough to fill the page
    };

    const { data: servicesData, isLoading: servicesLoading } = useServices(serviceParams);
    const services = servicesData?.services || [];

    // -- Handlers --
    const handleCategorySelect = (id) => {
        setSelectedCategoryId(id);
        setIsMobileFilterOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBookClick = (service) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setSelectedServiceForBooking(service);
        setIsBookingModalOpen(true);
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

    // Helper to safely display category name from service object
    const getServiceCategoryName = (service) => {
        // If populated, it is an object with .name
        if (service.category && typeof service.category === 'object') {
            return service.category.name;
        }
        // If not populated (just ID string), try to find in local categories
        if (service.category) {
            const cat = sidebarCategories.find(c => c._id === service.category || c.id === service.category);
            return cat ? cat.name : 'General';
        }
        return 'General';
    };

    return (
        <div className="min-h-screen bg-[#FAFAFB] dark:bg-[#080809] transition-colors duration-700 relative overflow-x-hidden">
            {/* Background Decoration */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[60%] h-[40%] bg-indigo-500/5 dark:bg-indigo-400/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[50%] h-[30%] bg-rose-500/3 dark:bg-rose-400/3 blur-[100px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto flex flex-col lg:flex-row min-h-screen">

                {/* -- SIDEBAR (Desktop) -- */}
                <aside className="hidden lg:flex flex-col w-80 border-r border-slate-200/50 dark:border-slate-800/50 p-10 space-y-8 shrink-0 h-screen sticky top-0 overflow-y-auto hide-scrollbar">
                    <div>
                        <h2 className="text-2xl font-[1000] tracking-tighter uppercase italic mb-8 text-slate-900 dark:text-white">
                            Explore <span className="text-indigo-600 dark:text-indigo-400 not-italic">Services.</span>
                        </h2>

                        <nav className="space-y-2">
                            <button
                                onClick={() => handleCategorySelect('All')}
                                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group ${selectedCategoryId === 'All' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <Grid className={`w-5 h-5 ${selectedCategoryId === 'All' ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                                    <span className="font-bold text-sm">All Services</span>
                                </div>
                                {selectedCategoryId === 'All' && <ChevronRight className="w-4 h-4 text-white" />}
                            </button>

                            {sidebarCategories.map((cat) => (
                                <button
                                    key={cat.id || cat._id}
                                    onClick={() => handleCategorySelect(cat.id || cat._id)}
                                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group ${selectedCategoryId === (cat.id || cat._id) ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`${selectedCategoryId === (cat.id || cat._id) ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'}`}>
                                            {getCategoryIcon(cat.name)}
                                        </div>
                                        <span className="font-bold text-sm">{cat.name}</span>
                                    </div>
                                    {selectedCategoryId === (cat.id || cat._id) && <ChevronRight className="w-4 h-4 text-white" />}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* -- MAIN CONTENT -- */}
                <main className="flex-1 p-6 md:p-12 lg:p-16">
                    <div className="max-w-6xl mx-auto">

                        {/* Header & Search */}
                        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-[1000] text-slate-900 dark:text-white tracking-tighter uppercase italic mb-4">
                                    {getCategoryName(selectedCategoryId)}
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">
                                    {servicesLoading ? 'Loading ecosystem...' : `${services.length} services available`}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="relative group w-full md:w-[320px]">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-2xl blur opacity-20 group-focus-within:opacity-100 transition duration-500" />
                                    <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-5 py-3">
                                        <Search className="w-5 h-5 text-slate-400 mr-3" />
                                        <input
                                            type="text"
                                            placeholder="Search services..."
                                            className="bg-transparent border-none outline-none w-full text-slate-900 dark:text-white font-bold text-sm placeholder:text-slate-300"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMobileFilterOpen(true)}
                                    className="lg:hidden p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-300"
                                >
                                    <Filter className="w-5 h-5" />
                                </button>
                            </div>
                        </header>

                        {/* Services Grid */}
                        <div className="min-h-100">
                            {servicesLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Loading Services...</p>
                                </div>
                            ) : services.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                                    {services.map((service) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={service.id || service._id}
                                            className="group bg-white dark:bg-[#0E0E10] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-3 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col"
                                        >
                                            <div className="aspect-video relative overflow-hidden rounded-4xl mb-4">
                                                <img
                                                    src={service.headerImage || service.image || 'https://images.unsplash.com/photo-1581578731117-104f2a41d58e?auto=format&fit=crop&q=80'}
                                                    alt={service.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-1.5 shadow-sm">
                                                    <Award className="w-3 h-3 text-indigo-500" />
                                                    Verified
                                                </div>
                                            </div>

                                            <div className="px-4 pb-4 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg">
                                                        {getServiceCategoryName(service)}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{service.rating > 0 ? service.rating : 'New'}</span>
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                                    {service.title}
                                                </h3>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
                                                    {service.description}
                                                </p>

                                                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Itera Price</p>
                                                        <p className="text-2xl font-black text-slate-900 dark:text-white">₹{service.price}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            className="rounded-xl px-4 py-2 h-auto text-xs font-bold uppercase tracking-wider"
                                                            onClick={() => navigate(`/services/${service.id || service._id}`)}
                                                        >
                                                            Details
                                                        </Button>
                                                        <Button
                                                            className="rounded-xl px-5 py-2 h-auto text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
                                                            onClick={() => handleBookClick(service)}
                                                        >
                                                            Book
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
                                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No services found</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mb-6">We couldn't find any services matching your criteria.</p>
                                    <Button onClick={() => { setSelectedCategoryId('All'); setSearchQuery(''); }}>
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <MobileBottomNav />

            {/* -- MOBILE FILTER SHEET -- */}
            <AnimatePresence>
                {isMobileFilterOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileFilterOpen(false)}
                            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-100 lg:hidden"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0A0A0B] z-101 rounded-t-[2.5rem] p-6 lg:hidden max-h-[80vh] overflow-y-auto"
                        >
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8" />
                            <h3 className="text-xl font-[1000] uppercase italic tracking-tighter mb-6 text-slate-900 dark:text-white">Select Category</h3>

                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    onClick={() => handleCategorySelect('All')}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${selectedCategoryId === 'All' ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-500'}`}
                                >
                                    <Grid className="w-5 h-5" /> All Services
                                </button>
                                {sidebarCategories.map(cat => (
                                    <button
                                        key={cat.id || cat._id}
                                        onClick={() => handleCategorySelect(cat.id || cat._id)}
                                        className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold text-sm transition-all ${selectedCategoryId === (cat.id || cat._id) ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-500'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {getCategoryIcon(cat.name)}
                                            {cat.name}
                                        </div>
                                        {selectedCategoryId === (cat.id || cat._id) && <CheckCircle className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* -- BOOKING MODAL -- */}
            {selectedServiceForBooking && (
                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    service={selectedServiceForBooking}
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
