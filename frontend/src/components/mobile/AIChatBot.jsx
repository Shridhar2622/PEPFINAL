import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, X, Send, User } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useSound } from '../../context/SoundContext';
import client from '../../api/client';

const AIChatBot = () => {
    const { isChatOpen, setIsChatOpen, user } = useUser();
    const { playGlassSound } = useSound();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your Reservice AI. How can I help you today?", sender: 'bot' }
    ]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsgText = input.trim();
        const userMsg = { id: Date.now(), text: userMsgText, sender: 'user' };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);
        playGlassSound();

        try {
            // Call our new backend AI endpoint
            const { data } = await client.post('/ai/chat', {
                message: userMsgText,
                history: messages.slice(-5) // Send last 5 messages for context
            });

            const botResponse = {
                id: Date.now() + 1,
                text: data.data.reply,
                sender: 'bot'
            };
            setMessages(prev => [...prev, botResponse]);
            playGlassSound();
        } catch (error) {
            console.error('AI Chat Error:', error);
            const errorMsg = {
                id: Date.now() + 1,
                text: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.",
                sender: 'bot'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Desktop Floating Trigger */}
            {!isChatOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0, rotate: -45 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        setIsChatOpen(true);
                        playGlassSound();
                    }}
                    className="fixed bottom-10 right-10 z-[90] hidden md:flex items-center justify-center group"
                >
                    {/* Multi-layered Neon Glow */}
                    <div className="absolute inset-0 bg-rose-500 rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-orange-400 rounded-full blur-md opacity-10 group-hover:opacity-30 transition-opacity duration-500" />

                    {/* Cybernetic Rotating Ring */}
                    <div className="absolute inset-x-[-3px] inset-y-[-3px] rounded-full p-[2px] bg-gradient-to-tr from-rose-500 via-orange-500 to-rose-500 animate-[spin_4s_linear_infinite] shadow-[0_0_15px_rgba(244,63,94,0.4)]" />

                    {/* Main Button Body - Glassmorphism */}
                    <div className="relative w-18 h-18 md:w-20 md:h-20 rounded-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/40 dark:border-white/10 transition-all overflow-hidden">
                        {/* Internal Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                        <Bot className="w-10 h-10 text-rose-600 dark:text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]" />

                        {/* Status Pulse */}
                        <div className="absolute top-5 right-5 flex">
                            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                        </div>
                    </div>

                    {/* Futuristic Hover Label */}
                    <div className="absolute right-24 opacity-0 group-hover:opacity-100 translate-x-8 group-hover:translate-x-0 transition-all duration-500 pointer-events-none whitespace-nowrap">
                        <div className="bg-slate-900/80 dark:bg-white/10 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/20 shadow-2xl">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white dark:text-rose-100 flex items-center gap-2">
                                <Sparkles className="w-3 h-3 text-orange-400" />
                                AI Assistant Online
                            </span>
                        </div>
                        {/* Small connector line */}
                        <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-[1px] bg-rose-500/50" />
                    </div>
                </motion.button>
            )}

            <AnimatePresence>
                {isChatOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsChatOpen(false)}
                            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[99]"
                        />

                        {/* Chat Window */}
                        <motion.div
                            initial={isMobile ? { y: "100%", opacity: 0 } : { y: 20, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={isMobile ? { y: "100%", opacity: 0 } : { y: 20, opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className={`fixed z-[100] bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-white/20 dark:border-slate-800/50 shadow-2xl overflow-hidden flex flex-col ${isMobile
                                ? 'bottom-0 left-0 right-0 h-[70vh] rounded-t-[2.5rem] border-t'
                                : 'bottom-10 right-10 w-[420px] h-[700px] rounded-[3rem] border shadow-[0_20px_50px_rgba(0,0,0,0.3)]'
                                }`}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-rose-500/10 to-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                                        <Bot className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                                            Reservice AI <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                                        </h3>
                                        <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Always Online</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsChatOpen(false)}
                                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 active:scale-90 transition-all font-bold"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                                {messages.map((msg) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={msg.id}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[80%] flex items-end gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-slate-200 dark:bg-slate-800' : 'bg-rose-500'}`}>
                                                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-white" />}
                                            </div>
                                            <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm ${msg.sender === 'user'
                                                ? 'bg-slate-900 dark:bg-rose-600 text-white rounded-br-none'
                                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-gray-100 dark:border-slate-700 rounded-bl-none'
                                                }`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {isTyping && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex justify-start"
                                    >
                                        <div className="flex items-end gap-2">
                                            <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center shrink-0">
                                                <Bot className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-bl-none">
                                                <div className="flex gap-1.5">
                                                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-6 pb-10 bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800">
                                <form onSubmit={handleSend} className="relative flex items-center gap-3">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Ask me anything..."
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 px-6 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500/20 transition-all outline-none pl-12"
                                        />
                                        <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500 opacity-50" />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!input.trim()}
                                        className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/20 active:scale-90 transition-all disabled:opacity-50 disabled:grayscale"
                                    >
                                        <Send className="w-6 h-6" />
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatBot;
