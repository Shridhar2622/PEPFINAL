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

        const isCaptchaEnabled = import.meta.env.VITE_ENABLE_CAPTCHA === 'true';

        if (isCaptchaEnabled && !recaptchaToken) {
            toast.error('Please complete the Captcha verification.');
            setIsLoading(false);
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
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row">
            {/* Left: Branding & Benefits */}
            <div className="lg:w-1/2 p-8 lg:p-12 bg-rose-600 flex flex-col justify-between text-white relative overflow-hidden">
                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2 mb-12">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-rose-600" />
                        </div>
                        <span className="text-2xl font-black tracking-tight">Reservice Partner</span>
                    </Link>

                    <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                        Turn your skills <br />into a business.
                    </h1>
                    <p className="text-rose-100 text-lg mb-12 max-w-md">
                        Join our network of verified technicians and get access to thousands of high-value jobs in your area.
                    </p>

                    <div className="space-y-6">
                        {[
                            { icon: TrendingUp, title: "Higher Earnings", desc: "Technicians earn 30% more on average" },
                            { icon: CheckCircle, title: "Verified Jobs", desc: "No haggling, verified customers only" },
                            { icon: Shield, title: "Instant Payouts", desc: "Get paid directly to your bank account" },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{item.title}</h3>
                                    <p className="text-rose-100/80 text-sm">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-rose-500 rounded-full blur-3xl opacity-50"></div>
            </div>

            {/* Right: Register Form */}
            <div className="lg:w-1/2 p-6 lg:p-12 flex items-center justify-center bg-white dark:bg-slate-950">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create Technician Account</h2>
                        <p className="text-slate-500 dark:text-slate-400">Fill in your details to get started.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                id="firstName"
                                label="First Name"
                                placeholder="Rajesh"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                            <Input
                                id="lastName"
                                label="Last Name"
                                placeholder="Kumar"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>

                        <Input
                            id="email"
                            label="Email Address"
                            type="email"
                            placeholder="you@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            id="phone"
                            label="Mobile Number"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />

                        <Input
                            id="pincode"
                            label="Pincode"
                            placeholder="123456"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            maxLength={6}
                            required
                        />

                        <Input
                            id="password"
                            label="Create Password"
                            type="password"
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

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
                                className="w-full py-4 text-base shadow-lg shadow-rose-500/20"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating Account...' : 'Continue'}
                            </Button>
                        </div>

                        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                            Already registered?{' '}
                            <Link to="/technician/login" className="font-bold text-rose-600 hover:text-rose-700">
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
