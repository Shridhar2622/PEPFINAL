import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Loader2, FileText, MapPin, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import Button from '../common/Button';
import Input from '../common/Input';

const BookingModal = ({ isOpen, onClose, service, onConfirm }) => {
    const { user, updateProfile } = useUser();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        date: '',
        description: '',
        address: user?.address || '',
        pickupLocation: user?.address || '',
        dropLocation: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);

    const handleDateChange = (e) => {
        const selectedDate = new Date(e.target.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            alert('Past dates are not allowed. Please select a future date.');
            return;
        }

        setFormData({ ...formData, date: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size should be less than 5MB");
                return;
            }
            setSelectedFile(file);
        }
    };

    // Reset success state and file when modal opens/closes
    React.useEffect(() => {
        if (!isOpen) {
            setIsSuccess(false);
            setSelectedFile(null);
            setFormData(prev => ({
                ...prev,
                date: '',
                description: '',
                dropLocation: ''
            }));
        }
    }, [isOpen]);

    // Update address if user data loads
    React.useEffect(() => {
        if (user?.address && !formData.address) {
            setFormData(prev => ({
                ...prev,
                address: user.address,
                pickupLocation: prev.pickupLocation || user.address
            }));
        }
    }, [user, isOpen, formData.address]);

    if (!isOpen || !service) return null;

    const isShiftingOrTransport = service.category === 'houseshifting' || service.category === 'transport';

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.date) {
            alert('Please select a date for your booking.');
            return;
        }

        // Validate date is not in the past
        const selectedDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            alert('Past dates are not allowed. Please select a future date.');
            return;
        }

        if (!service || (!service.id && !service._id)) {
            alert('Invalid service selected. Please try again.');
            return;
        }

        setIsLoading(true);


        try {
            // If user didn't have an address before, update their profile
            if (!user?.address && formData.address) {
                await updateProfile({ address: formData.address });
            }

            // Create sanitized booking data
            const bookingData = {
                ...formData,
                categoryId: service.categoryId, // Pass categoryId if available
                serviceId: service.id || service._id || service.serviceId,
                serviceName: service.title,
                price: service.price,
                referenceImageFile: selectedFile
            };

            // Sanitize: remove empty strings
            if (!bookingData.dropLocation) delete bookingData.dropLocation;
            if (!bookingData.pickupLocation) delete bookingData.pickupLocation;
            if (!bookingData.address) delete bookingData.address;

            const result = await onConfirm(bookingData);

            // CRITICAL: Only show success if onConfirm returns successfully (no exception)
            // and we have a valid result from the backend
            if (result) {
                setIsSuccess(true);
            } else {
                throw new Error("Booking failed - no result returned");
            }
        } catch (err) {
            console.error("Submission error:", err);
            // Error toast is handled by context
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md shadow-[0_20px_70px_rgba(0,0,0,0.3)] p-8 relative animate-in zoom-in-95 duration-300 border border-white/20">
                {!isSuccess && (
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-400 hover:text-slate-600 active:scale-90"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                <AnimatePresence mode="wait">
                    {!isSuccess ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div className="mb-8">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Reserve <span className="text-indigo-600">Pro.</span></h2>
                                <p className="text-slate-500 text-sm mt-2 font-medium">
                                    {service.title} <span className="mx-2 text-slate-300 font-light">|</span> <span className="font-bold text-slate-900 dark:text-slate-200">₹{service.price}</span>
                                </p>
                                {isShiftingOrTransport && (
                                    <div className="mt-4 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl">
                                        <p className="text-xs text-indigo-700 dark:text-indigo-300 font-bold tracking-tight">
                                            ESTIMATED RATE: Final price fixed after inspection.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <Input
                                        label="Preferred Date"
                                        type="date"
                                        icon={Calendar}
                                        value={formData.date}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={handleDateChange}
                                        required
                                    />

                                    {!isShiftingOrTransport && (
                                        <Input
                                            label="Service Address"
                                            placeholder="Where should we arrive?"
                                            icon={MapPin}
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value, pickupLocation: e.target.value })}
                                            required
                                        />
                                    )}

                                    {isShiftingOrTransport && (
                                        <>
                                            <Input
                                                label="Pickup Location"
                                                placeholder="Enter origin address"
                                                icon={MapPin}
                                                value={formData.pickupLocation}
                                                onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value, address: e.target.value })}
                                                required
                                            />
                                            <Input
                                                label="Drop Location"
                                                placeholder="Enter destination address"
                                                icon={MapPin}
                                                value={formData.dropLocation}
                                                onChange={(e) => setFormData({ ...formData, dropLocation: e.target.value })}
                                                required
                                            />
                                        </>
                                    )}

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                Reference Photo (Optional)
                                            </label>
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    id="referenceImage"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                                <label
                                                    htmlFor="referenceImage"
                                                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-400 transition-all cursor-pointer group"
                                                >
                                                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <ImageIcon className="w-5 h-5 text-indigo-600" />
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                                                            {selectedFile ? selectedFile.name : 'Choose a photo'}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400">Up to 5MB (JPG, PNG)</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                Special Instructions (Optional)
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute top-4 left-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <textarea
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-300 font-medium min-h-24 resize-none text-sm"
                                                    placeholder="Any specific requests for our experts?"
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <Button type="button" variant="ghost" className="flex-1 justify-center py-4 rounded-2xl border border-slate-200" onClick={onClose}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 justify-center py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 text-white font-black uppercase text-[10px] tracking-widest"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                Processing
                                            </>
                                        ) : (
                                            'Confirm Booking'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="flex flex-col items-center text-center py-10"
                        >
                            <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mb-10 shadow-inner">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                                >
                                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                                </motion.div>
                            </div>

                            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4 uppercase italic">Booking Sent!</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-lg font-bold leading-relaxed mb-12 max-w-[280px]">
                                Booking has been sent, check status in dashboard or continue shopping!
                            </p>

                            <div className="w-full space-y-4">
                                <Button
                                    onClick={() => navigate('/bookings')}
                                    className="w-full justify-center py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:scale-[1.02] transition-all"
                                >
                                    Check Dashboard
                                </Button>
                                <Button
                                    onClick={onClose}
                                    variant="ghost"
                                    className="w-full justify-center py-5 border border-slate-100 dark:border-slate-800 rounded-3xl font-black text-slate-400 uppercase text-[10px] tracking-widest hover:text-indigo-600"
                                >
                                    Keep Exploring
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default BookingModal;
