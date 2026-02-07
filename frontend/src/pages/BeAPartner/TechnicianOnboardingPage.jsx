import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTechnician } from '../../context/TechnicianContext';
import { useUser } from '../../context/UserContext'; // Import UserContext
import { Upload, Check, Loader, Clock, X } from 'lucide-react';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import client from '../../api/client';

const TechnicianOnboardingPage = () => {
    const { createProfile, technicianProfile, loading: isTechLoading, uploadDocuments } = useTechnician();
    const { user, isAuthenticated, isLoading: isUserLoading } = useUser();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Dynamic Skills State
    const [skillsList, setSkillsList] = useState([]);
    const [isSkillsLoading, setIsSkillsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await client.get('/categories');
                if (res.data.status === 'success') {
                    // Map categories to skill names
                    const categories = res.data.data.categories.map(cat => cat.name);
                    setSkillsList(categories);
                }
            } catch (err) {
                console.error("Failed to fetch skills", err);
                toast.error("Failed to load skills list. Please refresh.");
            } finally {
                setIsSkillsLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // Form State -- MOVED TO TOP to avoid Hook Errors
    const [bio, setBio] = useState('');
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Document State
    const [aadharCard, setAadharCard] = useState(null);
    const [panCard, setPanCard] = useState(null);
    const [resume, setResume] = useState(null);

    // Redirect if not logged in (after loading)
    useEffect(() => {
        if (!isUserLoading && !isAuthenticated) {
            toast.error("Please login to continue");
            navigate('/login');
        }
    }, [isUserLoading, isAuthenticated, navigate]);

    if (isUserLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // Check for existing profile status
    if (!isTechLoading && technicianProfile) {
        const status = technicianProfile.documents?.verificationStatus;

        if (status === 'PENDING') {
            return (
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl text-center">
                        <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Verification Pending</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8">
                            Your application is currently under review by our Admin team.
                            Please visit the admin office with your original documents for final verification.
                        </p>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="font-bold text-slate-900 dark:text-white text-sm">Status: <span className="text-yellow-600 uppercase">Pending Review</span></p>
                        </div>
                    </div>
                </div>
            );
        }

        if (status === 'REJECTED') {
            return (
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl text-center">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <X className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Application Rejected</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8">
                            Unfortunately, your technician application was rejected.
                            Please contact support for more information.
                        </p>
                    </div>
                </div>
            );
        }

        if (status === 'VERIFIED') {
            // Should ideally redirect, but just in case
            setTimeout(() => navigate('/technician/dashboard'), 100);
            return null;
        }
    }

    const handleSkillToggle = (skill) => {
        setSelectedSkills(prev =>
            prev.includes(skill)
                ? prev.filter(s => s !== skill)
                : [...prev, skill]
        );
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePhoto(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedSkills.length === 0) {
            toast.error("Please select at least one skill");
            return;
        }

        setIsLoading(true);

        try {
            // 1. Create Basic Profile
            toast.loading("Creating profile...", { id: 'onboarding' });
            const profileResult = await createProfile({
                bio: bio || "Professional Technician",
                skills: selectedSkills,
                profilePhoto
            });

            if (!profileResult.success) {
                toast.error(profileResult.message || "Failed to create profile", { id: 'onboarding' });
                setIsLoading(false);
                return;
            }

            // 2. Upload Mandatory Documents
            if (!aadharCard || !panCard) {
                toast.error("Aadhaar Card and PAN Card are mandatory", { id: 'onboarding' });
                setIsLoading(false);
                return;
            }

            toast.loading("Uploading documents...", { id: 'onboarding' });
            const docResult = await uploadDocuments({
                aadharCard,
                panCard,
                resume
            });

            if (docResult.success) {
                toast.success("Profile created & documents uploaded!", { id: 'onboarding' });
                setTimeout(() => {
                    navigate('/technician/dashboard');
                }, 1500);
            } else {
                toast.error(docResult.message || "Document upload failed", { id: 'onboarding' });
                setIsLoading(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.", { id: 'onboarding' });
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-blue-600 p-8 text-center">
                    <h1 className="text-3xl font-black text-white mb-2">Complete Your Profile</h1>
                    <p className="text-blue-100">Tell customers about yourself to get started.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Photo Upload */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 mb-4">
                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Upload className="w-10 h-10" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-md transition-colors">
                                <Upload className="w-4 h-4" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                        <p className="text-sm text-slate-500">Upload a professional photo</p>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">About You (Optional)</label>
                        <textarea
                            rows="4"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-0 transition-all resize-none"
                            placeholder="I have 5 years of experience in..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        ></textarea>
                        <p className="text-xs text-slate-400 mt-1 text-right">{bio.length}/500</p>
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Your Skills</label>
                        <div className="flex flex-wrap gap-2">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {isSkillsLoading ? (
                                    <div className="col-span-4 text-center py-4 text-slate-500">Loading skills...</div>
                                ) : skillsList.map((skill) => (
                                    <button
                                        key={skill}
                                        type="button"
                                        onClick={() => handleSkillToggle(skill)}
                                        className={`p-3 rounded-xl border font-bold text-sm transition-all ${selectedSkills.includes(skill)
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                                            }`}
                                    >
                                        {skill}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Document Uploads */}
                    <div className="space-y-6">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Verification Documents</label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Aadhaar */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 transition-colors cursor-pointer relative">
                                <input required type="file" accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setAadharCard(e.target.files[0])} />
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${aadharCard ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{aadharCard ? aadharCard.name : 'Aadhaar Card *'}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-black">Mandatory</p>
                                    </div>
                                </div>
                            </div>

                            {/* PAN */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 transition-colors cursor-pointer relative">
                                <input required type="file" accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setPanCard(e.target.files[0])} />
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${panCard ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{panCard ? panCard.name : 'PAN Card *'}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-black">Mandatory</p>
                                    </div>
                                </div>
                            </div>

                            {/* Resume */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 transition-colors cursor-pointer relative md:col-span-2">
                                <input type="file" accept=".pdf,.doc,.docx" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setResume(e.target.files[0])} />
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${resume ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{resume ? resume.name : 'CV / Resume (Optional)'}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-black">Optional</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            className="w-full py-4 text-lg shadow-xl shadow-blue-600/20"
                            disabled={isLoading || !bio || selectedSkills.length === 0 || !profilePhoto || !aadharCard || !panCard}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader className="w-5 h-5 animate-spin" />
                                    <span>Completing profile...</span>
                                </div>
                            ) : (
                                'Complete Setup'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TechnicianOnboardingPage;
