import React from 'react';
import { ArrowLeft, Home, Package, Shield, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileBottomNav from '../../components/mobile/MobileBottomNav';
import { useUser } from '../../context/UserContext';

const HouseShiftingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useUser();

    const handleCalculateQuote = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        alert('Generating a customized shifting quote for you...');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Mobile Header */}
            <div className="sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-sm border-b border-gray-100 dark:border-slate-800 md:hidden">
                <div className="flex items-center gap-4 px-4 py-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 dark:text-slate-300">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">House Shifting</h1>
                </div>
            </div>

            <main className="p-5">
                {/* Hero Image */}
                <div className="rounded-3xl overflow-hidden h-48 mb-6 shadow-md relative">
                    <img
                        src="https://images.unsplash.com/photo-1603803835816-35bb3a52b0df?auto=format&fit=crop&q=80&w=800"
                        alt="House Shifting"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <h2 className="text-3xl font-black text-white px-6 text-center">Seamless Relocation</h2>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Professional Moving Services</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
                        From studio apartments to large mansions, we handle every move with precision. Our service includes premium packing, safe dismantle/assembly, and secure transport.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <Package className="w-3 h-3" /> Premium Packing
                        </span>
                        <span className="bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Full Insurance
                        </span>
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 24-Hour Support
                        </span>
                    </div>
                </div>

                {/* Booking Action */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-4">Get a Shifting Quote</h4>
                    <form className="space-y-4" onSubmit={handleCalculateQuote}>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> FROM (Search City/Locality)
                            </label>
                            <input type="text" placeholder="Pickup current location" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-sm font-medium" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> TO (Search City/Locality)
                            </label>
                            <input type="text" placeholder="Drop destination location" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-sm font-medium" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">House Type</label>
                                <select className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-sm font-medium">
                                    <option>1 BHK</option>
                                    <option>2 BHK</option>
                                    <option>3 BHK</option>
                                    <option>Villa / Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Shifting Date</label>
                                <input type="date" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-sm font-medium" />
                            </div>
                        </div>
                        <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform mt-4">
                            Get Custom Quote
                        </button>
                    </form>
                </div>
            </main>

            <MobileBottomNav />
        </div>
    );
};

export default HouseShiftingPage;
