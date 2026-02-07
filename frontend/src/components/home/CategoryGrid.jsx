import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Star, MapPin, Heart, Sparkles, ChevronRight, Info, Layers
} from 'lucide-react';
import Button from '../common/Button';

const CategoryGrid = ({ categories = [], services = [], onBook, onDetails }) => {
    const navigate = useNavigate();

    // Group services to get stats if category fields are missing (fallback)
    const stats = React.useMemo(() => {
        const map = {};
        services.forEach(service => {
            const catId = service.category?.toLowerCase();
            if (!map[catId]) {
                map[catId] = {
                    minPrice: Infinity,
                    totalRating: 0,
                    count: 0
                };
            }
            const s = map[catId];
            s.minPrice = Math.min(s.minPrice, service.price || 0);
            if (service.rating) {
                s.totalRating += service.rating;
                s.count++;
            }
        });
        return map;
    }, [services]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-2 md:px-0">
            {categories.map((cat, index) => {
                const catStats = stats[cat.name?.toLowerCase()] || stats[cat.slug] || { minPrice: 0, count: 0, totalRating: 0 };

                // Use category's own fields if available, else fallback to aggregated stats
                const price = cat.price || catStats.minPrice === Infinity ? 0 : catStats.minPrice || cat.price || 0;
                const originalPrice = cat.originalPrice;
                const rating = cat.rating || (catStats.count > 0 ? (catStats.totalRating / catStats.count).toFixed(1) : 'New');

                return (
                    <div
                        key={cat.id || cat._id || index}
                        className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all duration-500 hover:-translate-y-2 flex flex-col"
                    >
                        {/* Image Section */}
                        <div className="relative h-72 overflow-hidden">
                            <img
                                src={cat.image || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800'}
                                alt={cat.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Gradient Overlays */}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/60 to-transparent"></div>
                            <div className="absolute inset-x-0 top-0 h-1/4 bg-linear-to-b from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            {/* Top Badges */}
                            <div className="absolute top-6 left-6 flex items-center justify-between w-[calc(100%-3rem)]">
                                <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg border border-white/20">
                                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                                        <Sparkles className="w-3 h-3 text-rose-500 fill-rose-500" />
                                        Best Seller
                                    </span>
                                </div>
                                <button className="p-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-rose-500 transition-all duration-300">
                                    <Heart className="w-4 h-4" />
                                </button>
                            </div>

                            {/* ETA Badge */}
                            <div className="absolute bottom-6 left-6">
                                <div className="bg-slate-900/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-white/90">Enable Location for ETA</span>
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8 flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors">
                                    {cat.name}
                                </h3>

                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-black text-xs ${rating === 'New' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-emerald-600 text-white border-emerald-500'}`}>
                                    {rating}
                                    <Star className={`w-3 h-3 ${rating === 'New' ? 'fill-emerald-600' : 'fill-white'}`} />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                                <Layers className="w-3 h-3" />
                                <span>{cat.name}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                <span>Home Services</span>
                            </div>

                            <div className="mt-auto flex items-center justify-between">
                                <div className="flex flex-col">
                                    {originalPrice && (
                                        <span className="text-xs text-slate-400 line-through font-medium">₹{originalPrice}</span>
                                    )}
                                    <span className="text-2xl font-black text-slate-900 dark:text-white">₹{price}</span>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => onDetails?.(cat)}
                                        variant="outline"
                                        className="rounded-2xl border-slate-100 bg-slate-50/50 hover:bg-white text-[10px] font-black uppercase tracking-widest px-4 py-3 h-auto"
                                    >
                                        View Details
                                    </Button>
                                    <Button
                                        onClick={() => onBook?.(cat)}
                                        className="rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 h-auto transition-all shadow-sm"
                                    >
                                        Book Now
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CategoryGrid;
