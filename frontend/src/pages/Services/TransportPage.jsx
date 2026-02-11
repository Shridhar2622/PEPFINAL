import React from 'react';
import { ArrowLeft, Truck, Package, Shield, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileBottomNav from '../../components/mobile/MobileBottomNav';
import { useUser } from '../../context/UserContext';

const TransportPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useUser();

    const handleCalculateFare = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        // Logic for calculating fare (dummy for now)
        alert('Calculating fare for your request...');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Mobile Header */}
            <div className="sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-sm border-b border-gray-100 dark:border-slate-800 md:hidden">
                <div className="flex items-center gap-4 px-4 py-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 dark:text-slate-300">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">Transport Services</h1>
                </div>
            </div>

            <main className="p-5">
                {/* Hero Image */}
                <div className="rounded-3xl overflow-hidden h-48 mb-6 shadow-md relative">
                    <img
                        src="https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&q=80&w=800"
                        alt="Transport"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <h2 className="text-3xl font-black text-white px-6 text-center">Safe & Secure Moving</h2>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Cargo & Logistics</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
                        We provide safe and reliable transport for commercial goods, parcels, and heavy equipment. Our fleet is equipped to handle all your logistical needs.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Insured
                        </span>
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <Truck className="w-3 h-3" /> GPS Tracking
                        </span>
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" /> On Time
                        </span>
                    </div>
                </div>

                {/* Booking Action */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-4">Request a Quote</h4>
                    <form className="space-y-4" onSubmit={handleCalculateFare}>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Pickup Location</label>
                            <input type="text" placeholder="Enter pickup address" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-sm font-medium" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Drop Location</label>
                            <input type="text" placeholder="Enter drop address" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-sm font-medium" />
                        </div>
                        <button className="w-full bg-rose-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-500/30 active:scale-95 transition-transform">
                            Calculate Fare
                        </button>
                    </form>
                </div>
            </main>

            <MobileBottomNav />
        </div>
    );
};

export default TransportPage;
