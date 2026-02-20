import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { Briefcase, CheckCircle, TrendingUp, Shield } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';
import ReCAPTCHA from 'react-google-recaptcha';
import { useRef } from 'react';

const TechnicianRegisterPage = () => {
    const { register } = useUser();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [pincode, setPincode] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    // Captcha
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const recaptchaRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const isCaptchaEnabled = import.meta.env.VITE_ENABLE_CAPTCHA === 'true';

            if (isCaptchaEnabled && !recaptchaToken) {
                toast.error('Please complete the Captcha verification.');
                // isLoading(false) handled in finally
                return;
            }

            const tokenToSend = isCaptchaEnabled ? recaptchaToken : 'bypass-token';
            const name = `${firstName} ${lastName}`.trim();

            // Register with role 'TECHNICIAN'
            const result = await register(name, email, password, password, phone, 'TECHNICIAN', tokenToSend, pincode);

            if (result.success) {
                toast.success("Account created! Let's set up your profile.");
                navigate('/technician/onboarding'); // Redirect to profile creation
            } else {
                toast.error(result.message || 'Registration failed');
                if (recaptchaRef.current) recaptchaRef.current.reset();
                setRecaptchaToken(null);
            }
        } catch (error) {
            console.error("Technician Register Error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }

    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row">
            {/* Left: Branding & Benefits */}
            {/* Left: Professional Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop"
                        alt="Professional Technician"
                        className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-slate-900/10"></div>
                </div>

                <div className="relative z-10 p-12 flex flex-col justify-between h-full w-full">
                    <div>
                        <Link to="/" className="flex items-center gap-3 w-fit group">
                            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform duration-300">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-wide">Reservice <span className="text-rose-500">Pro</span></span>
                        </Link>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h1 className="text-5xl font-black text-white leading-[1.1] mb-4">
                                Master your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">Own Path.</span>
                            </h1>
                            <p className="text-slate-300 text-lg max-w-md leading-relaxed">
                                Join India's fastest-growing network of service professionals.
                                Guaranteed payments, verified customers, and respect you deserve.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-emerald-400 mb-2" />
                                <h3 className="font-bold text-white text-lg">₹45k+</h3>
                                <p className="text-slate-400 text-sm">Average Monthly Earnings</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-blue-400 mb-2" />
                                <h3 className="font-bold text-white text-lg">Zero</h3>
                                <p className="text-slate-400 text-sm">Joining Fees</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
                            <div className="flex -space-x-3">
                                <img className="w-8 h-8 rounded-full border-2 border-slate-900" src="https://i.pravatar.cc/100?img=11" alt="" />
                                <img className="w-8 h-8 rounded-full border-2 border-slate-900" src="https://i.pravatar.cc/100?img=12" alt="" />
                                <img className="w-8 h-8 rounded-full border-2 border-slate-900" src="https://i.pravatar.cc/100?img=13" alt="" />
                            </div>
                            <p>Join 2,000+ Pros today</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Right: Register Form */}
            <div className="lg:w-1/2 p-6 lg:p-12 flex items-center justify-center bg-white dark:bg-slate-950">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create Technician Account</h2>
                        <p className="text-slate-500 dark:text-slate-400">Fill in your details to get started.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    id="firstName"
                                    label="First Name"
                                    placeholder="e.g. Rahul"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    className="py-2"
                                />
                                <Input
                                    id="lastName"
                                    label="Last Name"
                                    placeholder="Singh"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    className="py-2"
                                />
                            </div>

                            <Input
                                id="email"
                                label="Email Address"
                                type="email"
                                placeholder="name@work.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="py-2"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    id="phone"
                                    label="Mobile Number"
                                    type="tel"
                                    placeholder="+91..."
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    className="py-2"
                                />
                                <Input
                                    id="pincode"
                                    label="Service Pincode"
                                    placeholder="e.g. 560001"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    maxLength={6}
                                    required
                                    className="py-2"
                                />
                            </div>

                            <Input
                                id="password"
                                label="Create Password"
                                type="password"
                                placeholder="Min 8 chars"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="py-2"
                            />
                        </div>


                        <div className="pt-2">
                            {/* Captcha */}
                            {import.meta.env.VITE_ENABLE_CAPTCHA === 'true' && (
                                <div className="flex justify-center mb-4 captcha-container scale-90 origin-center">
                                    <ReCAPTCHA
                                        ref={recaptchaRef}
                                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                                        onChange={(token) => setRecaptchaToken(token)}
                                    />
                                </div>
                            )}

                            <Button
                                className="w-full py-4 text-base font-bold shadow-lg shadow-rose-600/20 hover:shadow-rose-600/30 transition-all hover:-translate-y-0.5"
                                disabled={isLoading}
                                size="lg"
                            >
                                {isLoading ? 'Setting up Profile...' : 'Create Partner Account'}

                            </Button>
                        </div>

                        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                            Already registered?{' '}
                            <Link to="/login" className="font-bold text-rose-600 hover:text-rose-700">

                                Log in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TechnicianRegisterPage;
