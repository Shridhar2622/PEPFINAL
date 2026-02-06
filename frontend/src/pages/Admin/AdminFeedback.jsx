import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { MessageSquarePlus, User as UserIcon, Clock, Star, X, Wrench, FolderPlus } from 'lucide-react';

const AdminFeedback = () => {
    const { feedbacks, reviews, deleteReview, addCategory } = useAdmin();

    const handleApproveCategoryRequest = async (fb) => {
        if (window.confirm(`Approve requested category: ${fb.requestedCategoryName}?`)) {
            await addCategory({
                name: fb.requestedCategoryName,
                description: `Created from user request: ${fb.message}`,
                image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?q=80&w=200', // placeholder
                icon: 'Plus',
                color: 'bg-indigo-100 text-indigo-600'
            });
            // Ideally mark feedback as processed, but context doesn't have markFeedbackProcessed yet
        }
    };

    return (
        <div className="space-y-8">
            {/* General Feedback Section */}
            <section>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                        <MessageSquarePlus className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">General Feedback</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">User messages from profile section</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {feedbacks.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800">
                            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No feedback received yet</p>
                        </div>
                    ) : feedbacks.map((fb) => (
                        <div key={fb._id} className="bg-white dark:bg-slate-900 p-6 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white text-sm">{fb.user?.name || 'Anonymous'}</p>
                                        <p className="text-[10px] text-slate-400 font-bold">{fb.user?.email || fb.user?.phone}</p>
                                    </div>
                                </div>
                                <div className="px-2 py-1 bg-amber-50 dark:bg-amber-500/10 rounded text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-tight">
                                    {fb.category}
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6 italic">"{fb.message}"</p>

                            {fb.category === 'Category Request' && (
                                <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Requested Category</p>
                                        <p className="font-bold text-slate-900 dark:text-white capitalize">{fb.requestedCategoryName}</p>
                                    </div>
                                    <button
                                        onClick={() => handleApproveCategoryRequest(fb)}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                                    >
                                        <FolderPlus className="w-4 h-4" /> Approve
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                <Clock className="w-3.5 h-3.5 text-slate-300" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {new Date(fb.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Service Reviews Section */}
            <section>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                        <Star className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Service Reviews</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ratings for completed bookings</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800">
                            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No reviews found</p>
                        </div>
                    ) : reviews.map((review) => (
                        <div key={review._id} className="bg-white dark:bg-slate-900 p-6 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                        <Star className="w-5 h-5 fill-current" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white text-sm">{review.customer?.name || 'Anonymous'}</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-2.5 h-2.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { if (window.confirm('Delete this review permanently?')) deleteReview(review._id) }}
                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6 italic">"{review.review}"</p>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                <div className="flex items-center gap-2">
                                    <Wrench className="w-3.5 h-3.5 text-slate-300" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Expert: {review.technician?.name || 'N/A'}</span>
                                </div>
                                <span className="text-[9px] font-black text-indigo-500 uppercase bg-indigo-50 dark:bg-indigo-900/10 px-2 py-0.5 rounded tracking-tighter">
                                    Ref: {review.booking?.substring(0, 8).toUpperCase() || 'MANUAL'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AdminFeedback;
