import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CareersPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            </div>

            <button
                onClick={() => navigate(-1)}
                className="absolute top-8 left-8 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl border border-white/10 transition-all active:scale-95 group z-10"
            >
                <ArrowLeft className="w-5 h-5 text-rose-400 group-hover:-translate-x-1 transition-transform" />
            </button>

            <div className="relative z-10 max-w-lg w-full text-center space-y-8">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', duration: 1.2 }}
                    className="flex justify-center"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-rose-600 to-orange-500 rounded-3xl p-0.5 shadow-2xl shadow-rose-500/20">
                        <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                            <Rocket className="w-10 h-10 text-white animate-bounce" />
                        </div>
                    </div>
                </motion.div>

                <div className="space-y-4">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl font-black tracking-tighter"
                    >
                        THE FUTURE <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-orange-400">IS WARPING IN</span>
                    </motion.h1>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="inline-block px-4 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full"
                    >
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-rose-400 animate-pulse">
                            Careers Portal • Status: Initializing
                        </span>
                    </motion.div>
                </div>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-slate-400 font-bold leading-relaxed text-lg"
                >
                    We're building the infrastructure for the next generation of service experts. Hold your breath, stay patient, and prepare for takeoff. ✨🌀
                </motion.p>


                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="pt-12 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]"
                >
                    Reservice Core © 2026
                </motion.div>
            </div>
        </div>
    );
};

export default CareersPage;
