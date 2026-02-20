import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Clock, CheckCircle, User, Calendar, ChevronRight, Search, History, XCircle, TrendingUp, ShieldQuestion, Phone, Mail, Sparkles, MapPin, LogOut, Moon, Sun } from 'lucide-react';
import Button from '../../components/common/Button';
import { useBookings } from '../../context/BookingContext';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import MobileBookingsPage from './MobileBookingsPage';
import BookingDetailPanel from '../../components/mobile/BookingDetailPanel';
import ReviewModal from '../../components/ui/ReviewModal';

const StatusBadge = ({ status, cancelledBy }) => {
    const styles = {
        Pending: 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20',
        Assigned: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-yellow-500/20',
        'In Progress': 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
        Completed: 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20',
        Canceled: 'bg-rose-600 text-white border-rose-700 shadow-sm',
    };

    const icons = {
        Pending: Clock,
        Assigned: User,
        'In Progress': TrendingUp,
        Completed: CheckCircle,
        Canceled: XCircle,
    };

    const Icon = icons[status] || Clock;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
            <Icon className="w-3.5 h-3.5" />
            {status === 'Canceled' || status === 'Cancelled' ? 'Cancelled' : status}
        </span>
    );
};

const BookingCard = ({ booking, cancelBooking, onViewDetails, onReview }) => {
    return (
        <div
            onClick={() => onViewDetails(booking)}
            className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all group cursor-pointer ${booking.status === 'Canceled' ? 'opacity-75 grayscale-[0.3]' : ''}`}
        >
            <div className="flex flex-col sm:flex-row gap-5">
                {/* Service Image */}
                <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                    <img
                        src={booking.service?.headerImage || booking.image || booking.service?.image}
                        alt={booking.serviceName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{booking.serviceName}</h3>
                                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                        {booking.date}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        {booking.time}
                                    </div>
                                    <div className="font-bold text-rose-600 dark:text-rose-400">
                                        ₹{booking.price}
                                    </div>
                                </div>
                            </div>
                            <StatusBadge status={booking.status} cancelledBy={booking.cancelledBy} />
                        </div>

                        {/* Technician Info (if assigned) */}
                        {booking.technician && (
                            <div className="mt-3 flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 w-fit">
                                <img
                                    src={booking.technician.image}
                                    alt={booking.technician.name}
                                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(booking.technician.name) + '&background=random';
                                    }}
                                />
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Technician</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{booking.technician.name}</p>
                                </div>
                            </div>
                        )}

                        {/* Happy Pin Display for User */}
                        {['Assigned', 'In Progress'].includes(booking.status) && booking.securityPin && (
                            <div className="mt-3 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-800/50 w-fit">
                                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Happy Pin:</span>
                                <span className="text-sm font-black text-blue-800 dark:text-blue-100 tracking-wider font-mono">{booking.securityPin}</span>
                            </div>
                        )}
                        {/* Cancellation Message */}
                        {booking.status === 'Canceled' && (
                            <div className="mt-4 flex flex-col gap-2 p-4 bg-rose-50/50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-800/50 w-full sm:w-fit">
                                <div className="flex items-center gap-2">
                                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                    <p className="text-sm font-bold text-rose-900 dark:text-rose-100">
                                        Cancelled
                                    </p>
                                </div>
                                <p className="text-xs font-medium text-rose-600 dark:text-rose-400 pl-6">
                                    Please give us one more chance.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 sm:mt-0 flex items-center justify-end gap-3">
                        {['Pending', 'Assigned'].includes(booking.status) && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Are you sure you want to cancel this request?')) {
                                        cancelBooking(booking.id);
                                    }
                                }}
                                className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
                            >
                                Cancel Request
                            </button>
                        )}

                        {booking.status === 'Completed' && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onReview(booking);
                                }}
                            >
                                <Sparkles className="w-3.5 h-3.5 mr-1 fill-current" />
                                {booking.rating > 0 ? 'Update Review' : 'Rate Service'}
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDetails(booking);
                            }}
                        >
                            View Details <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatsWidget = () => {
    const { bookings } = useBookings();

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Activity Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Total</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{bookings.length}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20">
                    <p className="text-blue-600 dark:text-blue-400 text-xs uppercase font-bold tracking-wider mb-1">Active</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                        {bookings.filter(b => ['Pending', 'Assigned'].includes(b.status)).length}
                    </p>
                </div>
            </div>
        </div>
    );
};

const SupportWidget = () => (
    <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg shadow-slate-900/10">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <ShieldQuestion className="w-5 h-5 text-blue-400" />
            Need Help?
        </h3>
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Having trouble with a booking? Our support team is available 24/7.
        </p>
        <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-300">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>support@reservice.com</span>
            </div>
        </div>
    </div>
);

const BookingsPage = () => {
    const [activeTab, setActiveTab] = useState('Pending'); // Pending, Assigned, Completed, History
    const { bookings, cancelBooking, updateBookingStatus } = useBookings();
    const { user, isAuthenticated, isLoading, logout } = useUser();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const containerRef = useRef(null);

    // Location State
    const [locationName, setLocationName] = useState(localStorage.getItem('user_location') || 'Detecting Location...');

    // Details & Review State
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [page, setPage] = useState(1);

    // Reset pagination when tab changes
    React.useEffect(() => {
        setPage(1);
    }, [activeTab]);

    React.useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isLoading, isAuthenticated, navigate]);

    useGSAP(() => {
        gsap.from(".animate-item", {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out"
        });
    }, { scope: containerRef });

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setIsDetailOpen(true);
    };

    const handleReview = (booking) => {
        setSelectedBooking(booking);
        setIsReviewOpen(true);
    };

    const handleLocationClick = () => {
        if (navigator.geolocation) {
            setLocationName('Locating...');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    // Fetch address from OpenStreetMap Nominatim API
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                        .then(response => response.json())
                        .then(data => {
                            const city = data.address.city || data.address.town || data.address.village || 'Unknown Location';
                            const state = data.address.state;
                            const formatted = `${city}, ${state}`;
                            setLocationName(formatted);
                            localStorage.setItem('user_location', formatted);
                        })
                        .catch(() => {
                            setLocationName('Location Error');
                        });
                },
                (error) => {
                    console.error(error);
                    setLocationName('Permission Denied');
                }
            );
        } else {
            setLocationName('Not Supported');
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

    if (!user) return null;

    const filteredBookings = bookings.filter(b => {
        if (activeTab === 'History' || activeTab === 'Completed') return ['Completed', 'Canceled'].includes(b.status);
        if (activeTab === 'Pending') return b.status === 'Pending';
        if (activeTab === 'Assigned') return ['Assigned', 'In Progress'].includes(b.status);
        return true;
    });

    const counts = {
        Pending: bookings.filter(b => b.status === 'Pending').length,
        Assigned: bookings.filter(b => ['Assigned', 'In Progress'].includes(b.status)).length,
        Completed: bookings.filter(b => ['Completed', 'Canceled'].includes(b.status)).length,
    };

    return (
        <>
            <div className="block md:hidden">
                <MobileBookingsPage />
            </div>
            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                {/* SIDEBAR - Fixed */}
                <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-col fixed h-full z-50 hidden lg:flex">
                    <Link to="/" className="p-6 flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-600/20">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Reservice</span>
                    </Link>
                    <nav className="flex-1 px-4 py-4 space-y-2">
                        <Link to="/services" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                            <Clock className="w-5 h-5" />
                            <span className="font-medium">Services</span>
                        </Link>
                        <div className="flex items-center gap-3 px-4 py-3 bg-rose-600 text-white rounded-xl transition-all shadow-lg shadow-rose-600/20">
                            <Calendar className="w-5 h-5" />
                            <span className="font-medium">Bookings</span>
                        </div>
                    </nav>

                    {/* Sidebar Footer Actions */}
                    <div className="px-4 pb-4 space-y-2">
                        <button
                            onClick={toggleTheme}
                            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>

                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to logout?')) {
                                    logout();
                                    navigate('/login');
                                }
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>

                    {/* Support Widget in Sidebar */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Support</p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <Phone className="w-4 h-4 text-rose-600" />
                                    <span>+91 98765 43210</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <Mail className="w-4 h-4 text-rose-600" />
                                    <span className="truncate">support@reservice.com</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT Area */}
                <main ref={containerRef} className="flex-1 lg:ml-64 min-h-screen relative">
                    {/* Background Decorations */}
                    <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[40px_40px] opacity-20 dark:opacity-5 pointer-events-none" />

                    {/* Header */}
                    <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 px-8 flex items-center justify-between">
                        <button
                            onClick={handleLocationClick}
                            className="flex items-center gap-2 text-slate-500 text-sm hover:text-rose-600 transition-colors cursor-pointer group"
                            title="Click to detect current location"
                        >
                            <MapPin className="w-4 h-4 group-hover:animate-bounce" />
                            <span>{locationName}</span>
                        </button>
                        <div className="flex items-center gap-4">
                            {/* Using existing button styles/logic for consistency if needed, but styling to match ref */}
                            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>
                            <Link to="/profile">
                                <button className="flex items-center gap-3 pl-1 pr-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden text-slate-500 dark:text-slate-300">
                                        {user.image ? <img src={user.image} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
                                    </div>
                                    <span className="font-medium text-sm text-slate-700 dark:text-slate-200">{user.name}</span>
                                </button>
                            </Link>
                        </div>
                    </header>

                    <div className="p-8 max-w-7xl mx-auto">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 animate-item">
                            <div>
                                <h1 className="text-4xl font-extrabold flex items-center gap-3 text-slate-900 dark:text-white">
                                    Welcome, {user.name.split(' ')[0]}
                                    <span className="animate-pulse">✨</span>
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Here's the latest update on your service requests.</p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setActiveTab('History')}
                                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold rounded-xl hover:shadow-md transition-all h-auto text-base"
                                >
                                    <History className="w-5 h-5" />
                                    History
                                </Button>
                                <Link to="/services">
                                    <Button className="flex items-center gap-2 px-8 py-3 bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-600/25 hover:shadow-rose-600/40 transform hover:-translate-y-0.5 transition-all h-auto text-base">
                                        <Clock className="w-5 h-5" />
                                        Book Service
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 animate-item">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Total Requests</span>
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-4xl font-bold text-slate-900 dark:text-white">{bookings.length}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Active Bookings</span>
                                    <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-lg">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-4xl font-bold text-rose-600">{bookings.filter(b => ['Pending', 'Assigned'].includes(b.status)).length}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Completed</span>
                                    <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-4xl font-bold text-slate-900 dark:text-white">{bookings.filter(b => ['Completed'].includes(b.status)).length}</p>
                            </div>

                            {/* Support Card */}
                            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg">Need Help?</h3>
                                    <p className="text-slate-400 text-sm mt-1">Our support team is 24/7 available for you.</p>
                                </div>
                                <Link to="/contact" className="relative z-10 mt-4 text-rose-500 font-bold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                                    Chat with us <ChevronRight className="w-4 h-4" />
                                </Link>
                                <div className="absolute -right-4 -bottom-4 opacity-10 transform group-hover:scale-110 transition-all">
                                    <ShieldQuestion size={80} />
                                </div>
                            </div>
                        </div>

                        {/* Bookings Lists */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-item">
                            {/* Custom Tabs */}
                            <div className="border-b border-slate-200 dark:border-slate-800 p-2">
                                <div className="flex">
                                    {['Pending', 'Assigned', 'Completed'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex-1 py-4 px-6 text-center font-bold border-b-2 transition-all text-sm sm:text-base ${activeTab === tab
                                                ? 'border-rose-600 text-rose-600'
                                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                                }`}
                                        >
                                            {tab}
                                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab
                                                ? 'bg-rose-600/10'
                                                : 'bg-slate-100 dark:bg-slate-800'
                                                }`}>
                                                {counts[tab]}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Booking Content */}
                            <div className={`p-6 ${filteredBookings.length === 0 ? 'min-h-100 flex flex-col items-center justify-center text-center' : ''}`}>
                                {filteredBookings.length > 0 ? (
                                    <div className="space-y-4">
                                        {filteredBookings.slice((page - 1) * 5, page * 5).map(booking => (
                                            <BookingCard
                                                key={booking.id}
                                                booking={booking}
                                                cancelBooking={cancelBooking}
                                                onViewDetails={handleViewDetails}
                                                onReview={handleReview}
                                            />
                                        ))}

                                        {/* Pagination Controls */}
                                        {Math.ceil(filteredBookings.length / 5) > 1 && (
                                            <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <button
                                                    onClick={() => {
                                                        if (page > 1) {
                                                            setPage(p => p - 1);
                                                            // window.scrollTo({ top: 0, behavior: 'smooth' }); // Optional: scroll to top of list
                                                        }
                                                    }}
                                                    disabled={page === 1}
                                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                                                >
                                                    Previous
                                                </button>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                    Page {page} of {Math.ceil(filteredBookings.length / 5)}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        if (page < Math.ceil(filteredBookings.length / 5)) {
                                                            setPage(p => p + 1);
                                                            // window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }
                                                    }}
                                                    disabled={page === Math.ceil(filteredBookings.length / 5)}
                                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                            <Search className="text-slate-300 dark:text-slate-600 w-10 h-10" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">No {activeTab.toLowerCase()} requests</h3>
                                        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                                            You don't have any requests in this category. Start by booking a new service above.
                                        </p>
                                        <Link to="/services">
                                            <Button
                                                variant="outline"
                                                className="mt-8 px-8 py-3 border-2 border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all h-auto"
                                            >
                                                Find Services
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Floating AI Button (from reference) */}


                </main>

                {/* Integration of Desktop Modals */}
                <BookingDetailPanel
                    isOpen={isDetailOpen}
                    booking={selectedBooking}
                    onClose={() => setIsDetailOpen(false)}
                    onUpdateStatus={updateBookingStatus}
                />

                {isReviewOpen && selectedBooking && (
                    <ReviewModal
                        bookingId={selectedBooking.id}
                        onClose={() => setIsReviewOpen(false)}
                        onSuccess={() => {
                            // Optionally refresh bookings or show success message
                            // Bookings are auto-updated by context if real-time or regular fetch
                        }}
                        initialData={{ rating: selectedBooking.rating, review: selectedBooking.review }}
                    />
                )}
            </div>
        </>
    );
};

export default BookingsPage;
