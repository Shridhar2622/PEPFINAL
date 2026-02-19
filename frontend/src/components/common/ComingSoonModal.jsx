import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Construction, X } from 'lucide-react';
import Button from './Button';

const ComingSoonModal = ({ isOpen, onClose, title = "Coming Soon" }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop with Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20, rotateX: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20, rotateX: 10 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 p-1 shadow-2xl backdrop-blur-xl ring-1 ring-white/10"
                    >
                        {/* Inner Container for Depth */}
                        <div className="relative rounded-[20px] bg-slate-950/50 p-6 sm:p-8 overflow-hidden">
                            {/* Animated Background Gradients */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl animate-pulse" />
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700" />

                            {/* Grid Pattern Overlay */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-20 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Content */}
                            <div className="relative z-10 flex flex-col items-center text-center">
                                {/* Animated Icon Container */}
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 to-orange-500 rounded-2xl blur-lg opacity-40 animate-pulse" />
                                    <div className="relative w-20 h-20 bg-gradient-to-tr from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl">
                                        <Construction className="w-10 h-10 text-rose-400" />
                                    </div>
                                    {/* Orbiting particles */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 rounded-full border border-dashed border-white/10 scale-150"
                                    />
                                </div>

                                <motion.h3
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2"
                                >
                                    {title}
                                </motion.h3>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 mb-6"
                                >
                                    <span className="text-xs font-semibold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                        </span>
                                        In Development
                                    </span>
                                </motion.div>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-slate-400 mb-8 leading-relaxed text-sm"
                                >
                                    We're crafting an exceptional experience. This feature is currently in the works and will be available soon.
                                </motion.p>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onClose}
                                    className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 p-[1px]"
                                >
                                    <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors" />
                                    <div className="relative bg-slate-900 rounded-xl px-4 py-3.5 transition-colors group-hover:bg-slate-900/80">
                                        <span className="font-bold text-white text-sm tracking-wide">Notify Me When Ready</span>
                                    </div>
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ComingSoonModal;
