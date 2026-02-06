import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp, Clock, Shield, ArrowRight } from 'lucide-react';
import MobileHeader from '../../components/mobile/MobileHeader'; // Reuse existing header
// import Footer from '../../components/common/Footer'; // If exists, or just use bottom nav/simple footer

const PartnerLandingPage = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-sans">
            <MobileHeader />

            {/* Hero Section */}
            <section className="relative pt-24 pb-12 px-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/4" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-6">
                            Join Reservice Partners
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                            Grow Your Business <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                On Your Terms
                            </span>
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Connect with thousands of customers looking for your expertise.
                            Set your own prices, choose your schedule, and get paid instantly.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                to="/partner/register"
                                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                Become a Partner <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/technician/login"
                                className="text-slate-600 dark:text-slate-400 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                Already a partner? Sign In
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats / Trust */}
            <section className="py-10 border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { label: "Active Partners", value: "2,000+" },
                        { label: "Jobs Completed", value: "50k+" },
                        { label: "Average Earnings", value: "₹35k/mo" },
                        { label: "Cities", value: "12+" }
                    ].map((stat, i) => (
                        <div key={i}>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</h3>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Benefits Grid */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: TrendingUp, title: "Zero Commission Period", desc: "Keep 100% of your earnings for the first 30 days. Transparent pricing afterwards." },
                            { icon: Clock, title: "Flexible Schedule", desc: "You are the boss. Go online when you want to work, go offline when you need a break." },
                            { icon: Shield, title: "Insurance Cover", desc: "Accidental insurance coverage up to ₹5 Lakhs for all verified partners on active jobs." },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800"
                                whileHover={{ y: -5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Steps */}
            <section className="py-20 px-6 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-black text-center text-slate-900 dark:text-white mb-16">How it works</h2>

                    <div className="space-y-12">
                        {[
                            { step: 1, title: "Register Online", desc: "Fill out your details and upload required documents (Aadhar, PAN) via our app." },
                            { step: 2, title: "Get Verified", desc: "Our team validates your profile within 48 hours to ensure quality standards." },
                            { step: 3, title: "Start Earning", desc: "Go online, accept bookings near you, and get paid directly to your bank account." }
                        ].map((item) => (
                            <div key={item.step} className="flex gap-6 md:gap-10 items-start">
                                <div className="w-12 h-12 shrink-0 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                                    {item.step}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-lg">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto bg-blue-600 rounded-[2.5rem] p-10 md:p-16 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    <h2 className="text-3xl md:text-5xl font-black mb-6 relative z-10">Ready to earn more?</h2>
                    <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto relative z-10 text-pretty">
                        Join the fastest growing service network in the country. Download the app or register now to get started.
                    </p>

                    <Link
                        to="/partner/register"
                        className="inline-block bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-blue-50 transition-colors relative z-10"
                    >
                        Register as Partner
                    </Link>
                </div>
            </section>

        </div>
    );
};

export default PartnerLandingPage;
