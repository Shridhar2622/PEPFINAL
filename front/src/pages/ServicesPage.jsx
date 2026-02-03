import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import ServiceCard from '../components/ServiceCard';
import api from '../services/api';
import { Search, Filter } from 'lucide-react';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const ServicesPage = () => {
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const categories = [
        'All',
        'Cleaning',
        'Plumbing',
        'Electrical',
        'Painting',
        'Carpentry',
        'AC Repair',
        'Appliance Repair',
        'Pest Control',
        'Gardening',
        'Renovation'
    ];
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRating, setMinRating] = useState(0);

    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        fetchServices();
        getUserLocation();
    }, []);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const coords = [longitude, latitude];
                    setUserLocation(coords);

                    // Persist location to User Profile
                    try {
                        const token = localStorage.getItem('token');
                        if (token) {
                            await api.patch('/users/update-me', {
                                location: {
                                    type: 'Point',
                                    coordinates: coords
                                }
                            });
                        }
                    } catch (error) {
                        console.error('Failed to save location', error);
                    }
                },
                (error) => {
                    console.error('Location error:', error);
                    if (error.code === 1) { // PERMISSION_DENIED
                        toast.error('Location permission denied. ETAs will not be available.', {
                            id: 'location-denied',
                            duration: 4000
                        });
                    } else {
                        toast.error('Unable to retrieve your location.', {
                            id: 'location-error'
                        });
                    }
                }
            );
        } else {
            toast.error('Geolocation is not supported by your browser.');
        }
    };

    const fetchServices = async () => {
        try {
            const { data } = await api.get('/services');
            // Adjust based on actual API response structure
            setServices(data.data.services || []);
        } catch (error) {
            console.error('Failed to fetch services', error);
            // Fallback/Mock data if API fails for dev
            setServices([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredServices = services.filter(service => {
        const matchesSearch = service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;

        const price = service.price || 0;
        const matchesPrice = (!minPrice || price >= Number(minPrice)) &&
            (!maxPrice || price <= Number(maxPrice));

        // Technicians might have generic avgRating or category-specific. 
        // Ideally we check category-specific if available, else overall.
        // For simplicity, let's use the overall avgRating available in technicianProfile.
        const rating = service.technician?.technicianProfile?.avgRating || 0;
        const matchesRating = rating >= minRating;

        return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="bg-indigo-600 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
                        Our Services
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-indigo-100">
                        Professional services for all your home needs.
                    </p>

                    <div className="mt-8 max-w-xl mx-auto relative">
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-6 py-4 rounded-full shadow-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
                        />
                        <div className="absolute right-3 top-3">
                            <Button size="sm" className="rounded-full h-10 w-10 p-0 flex items-center justify-center">
                                <Search size={18} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Filters */}
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">

                    {/* Categories */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Advanced Filters */}
                    <div className="flex flex-wrap items-center gap-4 border-l border-gray-100 pl-4">

                        {/* Price Range */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">Price:</span>
                            <input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <span className="text-gray-300">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* Rating Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">Rating:</span>
                            <select
                                value={minRating}
                                onChange={(e) => setMinRating(Number(e.target.value))}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            >
                                <option value="0">All</option>
                                <option value="4">4+ Stars</option>
                                <option value="3">3+ Stars</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Services Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredServices.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredServices.map(service => (
                            <ServiceCard key={service._id} service={service} userLocation={userLocation} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServicesPage;
