import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import api from '../services/api';
import Button from '../components/ui/Button';
import { Clock, Star, Shield, CheckCircle, Calendar, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../utils/media';

const ServiceDetailsPage = () => {
    const { id } = useParams();
    const Navigate = useNavigate();
    const { user } = useAuth();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [eta, setEta] = useState(null);
    const [userCoords, setUserCoords] = useState(null);

    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const { data } = await api.get(`/services/${id}`);
                setService(data.data.service);
            } catch (error) {
                console.error('Error fetching service', error);
                toast.error('Failed to load service details');
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id]);

    useEffect(() => {
        if (navigator.geolocation && service?.technician?.technicianProfile?.location?.coordinates) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                // Store coords for booking payload
                setUserCoords([longitude, latitude]);

                const techCoords = service.technician.technicianProfile.location.coordinates;

                const toRad = (value) => (value * Math.PI) / 180;
                const R = 6371; // km
                const dLat = toRad(techCoords[1] - latitude);
                const dLon = toRad(techCoords[0] - longitude);
                const a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(toRad(latitude)) * Math.cos(toRad(techCoords[1])) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distance = parseFloat((R * c).toFixed(1));
                const calculatedEta = Math.ceil((distance / 30) * 60 + 10);
                setEta(`${calculatedEta} mins away`);
            }, (error) => {
                console.error('Location error:', error);
                if (error.code === 1) {
                    toast.error('Location permission denied. ETA calculation disabled.', { id: 'location-denied' });
                }
            });
        } else if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser.', { id: 'no-geo' });
        }
    }, [service]);

    const handleBooking = async () => {
        if (!user) {
            toast.error('Please login to book a service');
            Navigate('/login');
            return;
        }
        if (!bookingDate || !bookingTime) {
            toast.error('Please select date and time');
            return;
        }

        const proceedWithBooking = async (coords = null) => {
            try {
                const scheduledAt = new Date(`${bookingDate}T${bookingTime}`);
                const payload = {
                    serviceId: service._id,
                    scheduledAt: scheduledAt.toISOString(),
                    notes: 'Booked via web frontend'
                };

                if (coords) {
                    payload.coordinates = coords;
                }

                await api.post('/bookings', payload);
                setShowSuccess(true);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Booking failed');
            }
        };

        // Use cached coords if available, otherwise just proceed without pestering user again
        if (userCoords) {
            proceedWithBooking(userCoords);
        } else {
            proceedWithBooking(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!service) return <div className="text-center py-20">Service not found</div>;

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center borderBorder-indigo-100 animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <CheckCircle size={40} className="animate-bounce-short" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                    <p className="text-gray-500 mb-8">
                        Your request for <span className="font-bold text-gray-700">{service.title}</span> has been sent.
                        The technician will confirm shortly.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button size="lg" onClick={() => Navigate('/dashboard')}>
                            Go to Dashboard
                        </Button>
                        <button onClick={() => Navigate('/services')} className="text-indigo-600 font-medium hover:underline py-2">
                            Browse More Services
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                    <div className="h-64 lg:h-auto relative">
                        <img
                            src={getMediaUrl(service.headerImage)}
                            alt={service.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1581578731117-104f2a41272c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80'; }}
                        />
                    </div>

                    <div className="p-8 lg:p-12">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded uppercase tracking-wide">
                                {service.category || 'Service'}
                            </span>
                            {service.technician?.technicianProfile?.documents?.verificationStatus === 'VERIFIED' && (
                                <div className="flex items-center gap-1.5 text-xs font-black text-green-700 bg-green-50 border border-green-100 px-3 py-1 rounded-full uppercase italic tracking-widest shadow-sm">
                                    <ShieldCheck size={14} />
                                    Verified Pro
                                </div>
                            )}
                            <div className="flex items-center text-yellow-400">
                                <Star className="fill-current" size={16} />
                                <span className="text-gray-600 text-sm ml-1 font-medium">{service.rating || '4.8'} (120 reviews)</span>
                            </div>
                        </div>

                        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{service.title}</h1>
                        <p className="text-gray-500 mb-6 text-lg leading-relaxed">{service.description}</p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="flex items-center gap-3 text-gray-700">
                                <Clock className="text-indigo-500" />
                                <span className="font-medium text-indigo-700">{eta || 'Calculating ETA...'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <Shield className="text-indigo-500" />
                                <span>Verified Pros</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Book this Service</h3>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={bookingDate}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                    <input
                                        type="time"
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={bookingTime}
                                        onChange={(e) => setBookingTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500">Total Price</span>
                                    <span className="text-3xl font-bold text-gray-900">${service.price}</span>
                                </div>
                                <Button size="lg" onClick={handleBooking}>
                                    Confirm Booking
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailsPage;
