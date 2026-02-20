import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Home, Grid, Calendar, LayoutGrid, Wind, Droplets, Zap, Sparkles,
    Moon, Sun, MapPin, User, Search, ChevronRight, BadgeCheck, Heart, Star,
    Bot,
    Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookings } from '../../context/BookingContext';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { useCategories, useServices } from '../../hooks/useServices';
import BookingModal from '../../components/bookings/BookingModal';
import MobileBottomNav from '../../components/mobile/MobileBottomNav';


const ServicesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addBooking } = useBookings();
    const { isAuthenticated, user, saveService, removeService } = useUser();
    const { theme, toggleTheme } = useTheme();

    // -- Data Fetching --
    const { data: categoriesRaw = [], isLoading: categoriesLoading } = useCategories();

    // Filter categories

    const sidebarCategories = (categoriesRaw || []).filter(c =>
        c.isActive !== false &&
        !c.name.toUpperCase().includes('P2_CAT') &&
        !c.name.toUpperCase().includes('DEBUG')
    ).sort((a, b) => (a.order || 99) - (b.order || 99));

    // -- State --
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState(location.state?.categoryId || location.state?.category || 'All');
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isPopularExpanded, setIsPopularExpanded] = useState(false);
    const [page, setPage] = useState(1);

    // Helpers
    const getCategoryIcon = (name) => {
        if (!name) return <LayoutGrid className="w-5 h-5" />;
        const key = name.toLowerCase().replace(/\s+/g, '');
        if (key.includes('ac') || key.includes('air')) return <Wind className="w-5 h-5" />;
        if (key.includes('plumb') || key.includes('water')) return <Droplets className="w-5 h-5" />;
        if (key.includes('electr') || key.includes('power')) return <Zap className="w-5 h-5" />;
        if (key.includes('clean') || key.includes('wash')) return <Sparkles className="w-5 h-5" />;
        return <LayoutGrid className="w-5 h-5" />;
    };

    // Prepare Query Params
    const serviceParams = {
        category: selectedCategoryId === 'All' ? undefined : selectedCategoryId,
        search: searchQuery || undefined,
        limit: 4,
        page
    };

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [selectedCategoryId, searchQuery]);

    const { data: servicesData, isLoading: servicesLoading } = useServices(serviceParams);
    const services = servicesData?.services || [];

    // Handlers
    const handleCategorySelect = (id) => {
        setSelectedCategoryId(id);

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

    const handleToggleSave = async (id, e) => {
        e.stopPropagation();
        if (!isAuthenticated) return navigate('/login');
        const isSaved = user?.savedServices?.some(s => (s._id || s) === id);
        if (isSaved) {
            await removeService(id);
        } else {
            await saveService(id);
        }
    };

    // Helper to get category name from service
    const getCategoryNameFromService = (service) => {
        if (service.category && typeof service.category === 'object') return service.category.name;
        if (service.category) {
            const cat = sidebarCategories.find(c => c._id === service.category || c.id === service.category);
            return cat ? cat.name : 'Service';
        }
        return 'Service';
    };

    const visibleSidebarCategories = isSidebarExpanded ? sidebarCategories : sidebarCategories.slice(0, 5);
    const visiblePopularCategories = isPopularExpanded ? sidebarCategories : sidebarCategories.slice(0, 5);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">

            {/* SIDEBAR */}
            <aside className="w-80 h-screen fixed top-0 left-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col z-50 hidden lg:flex">
                <Link to="/" className="p-8 flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-600/20">
                        <Wrench className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Reservice</span>
                </Link>

                <div className="flex-1 overflow-y-auto px-6 py-4 hide-scrollbar">
                    <nav className="space-y-2 mb-10">
                        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Main Menu</p>
                        <Link to="/services" className="flex items-center gap-4 px-4 py-3 bg-rose-600 text-white shadow-lg shadow-rose-600/20 font-semibold transition-all rounded-2xl">
                            <Grid className="w-5 h-5" />
                            Services
                        </Link>
                        <Link to="/bookings" className="flex items-center gap-4 px-4 py-3 text-slate-600 dark:text-slate-400 font-semibold hover:text-rose-600 transition-all rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800">
                            <Calendar className="w-5 h-5" />
                            Bookings
                        </Link>
                    </nav>

                    <div className="space-y-2">
                        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Explore Services</p>
                        <button
                            onClick={() => handleCategorySelect('All')}
                            className={`flex items-center justify-between group px-4 py-3 w-full rounded-2xl transition-all ${selectedCategoryId === 'All' ? 'bg-indigo-500/10 text-indigo-500' : 'text-slate-500 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <span className="font-bold">All Services</span>
                        </button>

                        {visibleSidebarCategories.map(cat => (
                            <button
                                key={cat.id || cat._id}
                                onClick={() => handleCategorySelect(cat.id || cat._id)}
                                className={`flex items-center gap-4 px-4 py-3 w-full rounded-2xl transition-all ${selectedCategoryId === (cat.id || cat._id) ? 'bg-indigo-500/10 text-indigo-500' : 'text-slate-500 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                <span className="font-semibold">{cat.name}</span>
                            </button>
                        ))}

                        {sidebarCategories.length > 5 && (
                            <button
                                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                                className="flex items-center gap-4 px-4 py-3 w-full rounded-2xl transition-all text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800"
                            >
                                <div className="text-current">
                                    {isSidebarExpanded ? <ChevronRight className="w-5 h-5 rotate-270" /> : <ChevronRight className="w-5 h-5 rotate-90" />}
                                </div>
                                <span>{isSidebarExpanded ? 'Show Less' : 'View More'}</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                        >
                            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </button>
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                            <MapPin className="w-4 h-4" />
                            <span>{localStorage.getItem('user_location')?.split(',')[0] || 'PHAGWARA'}</span>
                        </div>
                    </div>
                    {isAuthenticated ? (
                        <div className="w-full flex items-center gap-3 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-2xl">
                            <img
                                src={user?.image || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                                alt={user?.name}
                                className="w-6 h-6 rounded-full"
                            />
                            <span className="truncate">{user?.name}</span>
                        </div>
                    ) : (
                        <Link to="/login" className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-2xl transition-all hover:bg-slate-200 dark:hover:bg-slate-700">
                            <User className="w-5 h-5" />
                            Login
                        </Link>
                    )}
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 min-h-screen relative z-10 text-slate-900 dark:text-slate-100 lg:ml-80">
                <div className="max-w-[1400px] mx-auto p-4 md:p-8">

                    {/* Header Text */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">Browse Services</h1>
                        <p className="text-base md:text-lg text-slate-500 dark:text-slate-400">Connect with top-rated professionals in your area.</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-8 max-w-3xl">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-slate-400" />
                        </div>
                        <input
                            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 border-none rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none focus:ring-2 focus:ring-rose-500/20 text-base font-medium outline-none"
                            placeholder="Search for 'Electrician'..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Popular Categories */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Popular Categories</span>
                            {sidebarCategories.length > 5 && (
                                <button
                                    onClick={() => setIsPopularExpanded(!isPopularExpanded)}
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 flex items-center gap-1 hover:underline"
                                >
                                    {isPopularExpanded ? 'Show Less' : 'View All'} <ChevronRight className={`w-4 h-4 transition-transform ${isPopularExpanded ? 'rotate-90' : ''}`} />
                                </button>
                            )}
                        </div>
                        <AnimatePresence>
                            <motion.div
                                layout
                                className="flex flex-wrap gap-3"
                            >
                                <button
                                    onClick={() => handleCategorySelect('All')}
                                    className={`px-6 py-2 rounded-full font-bold text-sm shadow-md transition-all ${selectedCategoryId === 'All' ? 'bg-rose-600 text-white shadow-rose-600/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 hover:border-rose-600'}`}
                                >
                                    ALL
                                </button>
                                {visiblePopularCategories.map(cat => (
                                    <motion.button
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        key={cat.id || cat._id}
                                        onClick={() => handleCategorySelect(cat.id || cat._id)}
                                        className={`px-6 py-2 rounded-full font-bold text-sm transition-all border ${selectedCategoryId === (cat.id || cat._id)
                                            ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700 hover:border-rose-600'}`}
                                    >
                                        {cat.name.toUpperCase()}
                                    </motion.button>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Services Divider / Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                        <div className="px-5 py-2 bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 flex items-center gap-2 shadow-sm">
                            <div className="text-rose-600">
                                {selectedCategoryId === 'All' ? <LayoutGrid className="w-4 h-4" /> : getCategoryIcon(sidebarCategories.find(c => (c.id || c._id) === selectedCategoryId)?.name)}
                            </div>
                            <span className="font-black uppercase tracking-[0.2em] text-xs">
                                {selectedCategoryId === 'All' ? 'ALL SERVICES' : `${sidebarCategories.find(c => (c.id || c._id) === selectedCategoryId)?.name} SERVICES`}
                            </span>
                        </div>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                    </div>

                    {/* Services Grid */}
                    {servicesLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full" />
                        </div>
                    ) : services.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                                {services.map(service => {
                                    const isSaved = user?.savedServices?.some(s => (s._id || s) === (service.id || service._id));
                                    return (
                                        <div
                                            key={service.id || service._id}
                                            className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/20 dark:shadow-none transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-600/10"
                                        >
                                            <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                <img
                                                    src={service.headerImage || service.image || 'https://images.unsplash.com/photo-1581578731117-104f2a41d58e?auto=format&fit=crop&q=80'}
                                                    alt={service.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute top-4 left-4">
                                                    <span className="px-3 py-1 bg-white/90 backdrop-blur text-[10px] font-black uppercase tracking-widest text-rose-600 rounded-full flex items-center gap-1.5 shadow-sm">
                                                        <BadgeCheck className="w-3.5 h-3.5 fill-rose-600 text-white" />
                                                        Verified
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={(e) => handleToggleSave(service.id || service._id, e)}
                                                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors shadow-sm"
                                                >
                                                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600 text-rose-600' : ''}`} />
                                                </button>
                                            </div>
                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{service.title}</h3>
                                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                                            <span className="font-bold text-sm">{service.rating > 0 ? service.rating : 'New'}</span>
                                                            <span className="text-[10px]">({service.reviews?.length || 0} Reviews)</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xl font-black text-rose-600">₹{service.price}</span>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleBookClick(service)}
                                                    className="w-full py-3 bg-slate-900 dark:bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-rose-600 dark:hover:bg-rose-600 transition-colors shadow-md shadow-slate-900/10"
                                                >
                                                    Book Now
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination Controls */}
                            {servicesData?.pagination && servicesData.pagination.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-4 mb-20">
                                    <button
                                        onClick={() => {
                                            if (page > 1) {
                                                setPage(p => p - 1);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }
                                        }}
                                        disabled={page === 1}
                                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        Page {servicesData.pagination.page} of {servicesData.pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => {
                                            if (page < servicesData.pagination.totalPages) {
                                                setPage(p => p + 1);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }
                                        }}
                                        disabled={page === servicesData.pagination.totalPages}
                                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No services found</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">We couldn't find any services matching your criteria.</p>
                            <button onClick={() => { setSelectedCategoryId('All'); setSearchQuery(''); }} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold">
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Floating AI Button */}
            <div className="fixed bottom-10 right-10 z-50 hidden md:block">
                <button
                    onClick={() => window.openChat && window.openChat()}
                    className="w-16 h-16 bg-white dark:bg-slate-800 text-rose-600 rounded-full shadow-2xl shadow-rose-600/20 flex items-center justify-center hover:scale-110 transition-transform group relative border-4 border-rose-50 dark:border-slate-700"
                >
                    <Bot className="w-8 h-8" />
                    <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-4 border-white dark:border-slate-800 rounded-full"></span>
                    <div className="absolute right-full mr-6 bg-slate-900 text-white px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                        Need help finding a service?
                    </div>
                </button>

            </div>

            <MobileBottomNav />

            {/* Booking Modal */}

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
