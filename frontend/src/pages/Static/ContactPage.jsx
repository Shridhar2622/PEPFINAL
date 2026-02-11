import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquare, Phone, Send, Sparkles, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const ContactPage = () => {
    const navigate = useNavigate();
    const { setIsChatOpen } = useUser();
    const [activeTab, setActiveTab] = useState('chat');
    const [message, setMessage] = useState('');
    const [isSent, setIsSent] = useState(false);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Simulating message send
        setIsSent(true);
        setMessage('');
        setTimeout(() => setIsSent(false), 3000);
    };

    const handleCall = () => {
        window.location.href = 'tel:+919876543210';
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 dark:bg-slate-900 p-6 pt-12 pb-12 rounded-b-[3rem] relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/20 rounded-full -ml-24 -mb-24 blur-3xl"></div>

                <div className="relative z-10 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-xl font-black text-white uppercase tracking-widest">Support Core</h1>
                    <div className="w-11"></div>
                </div>

                <div className="relative z-10 mt-8 text-center px-4">
                    <p className="text-rose-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2">24/7 Availability</p>
                    <h2 className="text-3xl font-black text-white leading-tight">How can we <br />help you today?</h2>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 -mt-8 relative z-20">
                <div className="bg-white dark:bg-slate-900 p-2 rounded-[2rem] shadow-xl shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800 flex gap-2">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'chat' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-400'}`}
                    >
                        <MessageSquare className="w-4 h-4" /> Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('call')}
                        className={`flex-1 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'call' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-400'}`}
                    >
                        <Phone className="w-4 h-4" /> Call
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 px-6 pt-8 pb-32 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'chat' ? (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Need quick resolution?</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Our AI Support is ready to help</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsChatOpen(true)}
                                    className="w-full py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors"
                                >
                                    Launch AI Assistant
                                </button>
                            </div>

                            <form onSubmit={handleSendMessage} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Direct Message</label>
                                    <div className="relative">
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Tell us what's on your mind..."
                                            className="w-full p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 outline-none focus:border-rose-500 transition-all text-sm font-medium text-slate-900 dark:text-white min-h-[160px] shadow-sm resize-none"
                                        />
                                        <button
                                            type="submit"
                                            className="absolute bottom-4 right-4 w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20 active:scale-90 transition-all hover:bg-rose-700"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {isSent && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-[1.5rem] flex items-center gap-3"
                                >
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    <p className="text-xs font-black text-green-700 dark:text-green-400 uppercase">Message received. We'll be in touch soon!</p>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="call"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="p-8 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 rounded-[3rem] text-center space-y-6">
                                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/5">
                                    <Phone className="w-8 h-8 text-rose-600 animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Instant Helpline</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold max-w-[200px] mx-auto leading-relaxed">
                                        Speak directly with our service experts for immediate aid.
                                    </p>
                                </div>
                                <button
                                    onClick={handleCall}
                                    className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-lg tracking-widest shadow-2xl active:scale-95 transition-all"
                                >
                                    CALL NOW
                                </button>
                                <div className="flex items-center justify-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">
                                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 8am - 10pm</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Secured</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] flex flex-col items-center gap-2 text-center">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-rose-600">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">WhatsApp</span>
                                </div>
                                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] flex flex-col items-center gap-2 text-center">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-rose-600">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Call Back</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Support Metrics */}
            <div className="px-6 pb-24">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl flex justify-around">
                    <div className="text-center">
                        <p className="text-xs font-black text-slate-900 dark:text-white">98%</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Resolution</p>
                    </div>
                    <div className="w-px bg-slate-200 dark:bg-slate-800 my-1"></div>
                    <div className="text-center">
                        <p className="text-xs font-black text-slate-900 dark:text-white">&lt; 5min</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Wait Time</p>
                    </div>
                    <div className="w-px bg-slate-200 dark:bg-slate-800 my-1"></div>
                    <div className="text-center">
                        <p className="text-xs font-black text-slate-900 dark:text-white">4.9/5</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">CSAT Score</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;

// Add Globe import if missing from lucide-react in top but I used existing ones or standard.
import { Globe } from 'lucide-react';
