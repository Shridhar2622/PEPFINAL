import { Link } from 'react-router-dom';
import { Clock, Star, Edit2, Trash2, ShieldCheck } from 'lucide-react';
import Button from './ui/Button';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getMediaUrl } from '../utils/media';

const ServiceCard = ({ service, onUpdate, userLocation }) => {
    const { user } = useAuth();
    const currentUserId = user?._id || user?.id;
    const technicianId = service.technician?._id || service.technician;
    const isOwner = currentUserId === technicianId;

    const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        try {
            await api.delete(`/services/${service._id}`);
            toast.success('Service deleted successfully');
            if (onUpdate) onUpdate();
            else window.location.reload(); // Fallback
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    const isTechnicianOnline = service.technician?.technicianProfile?.isOnline;

    // ETA Logic
    const techLocation = service.technician?.technicianProfile?.location;
    let eta = null;
    let distance = null;

    if (userLocation && techLocation?.coordinates) {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371; // km
        const [lon1, lat1] = userLocation;
        const [lon2, lat2] = techLocation.coordinates;

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distance = parseFloat((R * c).toFixed(1));

        // Est: 30km/h + 10 mins buffer
        eta = Math.ceil((distance / 30) * 60 + 10);
    }

    // If not owner and technician is offline, show offline state
    const isOffline = !isOwner && isTechnicianOnline === false;

    return (
        <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group ${isOffline ? 'opacity-75 grayscale' : ''}`}>
            <div className="relative h-48 overflow-hidden">
                <img
                    src={getMediaUrl(service.headerImage)}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1581578731117-104f2a41272c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'; }}
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-sm font-semibold text-indigo-600 flex items-center gap-1 shadow-sm">
                    <Star size={14} className="fill-indigo-600" />
                    {service.technician?.technicianProfile?.avgRating > 0
                        ? service.technician.technicianProfile.avgRating
                        : 'New'}
                </div>

                {isOffline && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="bg-gray-800 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-xl flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            Temporarily Offline
                        </span>
                    </div>
                )}

                {/* ETA Badge */}
                {!isOffline && !isOwner && (
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-white flex items-center gap-1">
                        {eta ? (
                            <>
                                <span className="text-green-400">●</span> {eta} mins away ({distance} km)
                            </>
                        ) : (
                            <span className="text-gray-300">Enable Location for ETA</span>
                        )}
                    </div>
                )}

                {isOwner && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Link to={`/technician/edit-service/${service._id}`}>
                            <button className="p-3 bg-white text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors shadow-lg">
                                <Edit2 size={20} />
                            </button>
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="p-3 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors shadow-lg"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-semibold tracking-wide uppercase px-2 py-1 rounded-full ${isOffline ? 'bg-gray-100 text-gray-500' : 'text-indigo-500 bg-indigo-50'}`}>
                        {service.category || 'Service'}
                    </span>
                    {service.technician?.technicianProfile?.documents?.verificationStatus === 'VERIFIED' && (
                        <div className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-tighter">
                            <ShieldCheck size={12} />
                            Verified
                        </div>
                    )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{service.title}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{service.description}</p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400">Starting at</span>
                        <span className="text-lg font-bold text-gray-900">${service.price}</span>
                    </div>
                    {isOwner ? (
                        <div className="flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                            Your Service
                        </div>
                    ) : (
                        isOffline ? (
                            <Button size="sm" disabled className="bg-gray-200 text-gray-500 cursor-not-allowed border-none shadow-none">
                                Unavailable
                            </Button>
                        ) : (
                            <Link to={`/services/${service._id}`}>
                                <Button size="sm">Book Now</Button>
                            </Link>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;
