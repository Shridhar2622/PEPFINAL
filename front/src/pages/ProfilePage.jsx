import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Lock, Camera, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMediaUrl } from '../utils/media';

const ProfilePage = () => {
    const { user, login } = useAuth(); // login used to update user context
    const [activeTab, setActiveTab] = useState('details'); // details, security
    const [loading, setLoading] = useState(false);

    // Details Form State
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || ''
    });
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(() => getMediaUrl(user?.profilePhoto, user?.name));

    // Security Form State
    const [securityData, setSecurityData] = useState({
        passwordCurrent: '',
        password: '',
        passwordConfirm: ''
    });

    const fileInputRef = useRef(null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleDetailsSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (profilePhoto) data.append('profilePhoto', profilePhoto);

            const response = await api.patch('/users/update-me', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update local user context (hacky way, ideally context exposes update method)
            // Assuming the simple auth implementation might simpler reload or manual update
            toast.success('Profile updated successfully! Please refresh to see changes.');
            // Ideally: login({ ...user, ...response.data.data.user }, token); 

        } catch (error) {
            console.error('Update profile error', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSecuritySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (securityData.password !== securityData.passwordConfirm) {
                return toast.error('New passwords do not match');
            }

            await api.patch('/users/updatePassword', {
                passwordCurrent: securityData.passwordCurrent,
                password: securityData.password,
                passwordConfirm: securityData.passwordConfirm
            });

            toast.success('Password updated successfully!');
            setSecurityData({ passwordCurrent: '', password: '', passwordConfirm: '' });
        } catch (error) {
            console.error('Update password error', error);
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="flex flex-col md:flex-row">
                        {/* Sidebar */}
                        <div className="md:w-64 bg-gray-50 border-r border-gray-100 p-6">
                            <div className="flex flex-col items-center mb-8">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-200">
                                        {photoPreview ? (
                                            <img
                                                src={photoPreview}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name)}&background=random`; }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <User size={40} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white" size={24} />
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                />
                                <h3 className="mt-4 font-bold text-gray-900">{user?.name}</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                        {user?.role}
                                    </span>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'details'
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <User size={18} />
                                    Profile Details
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'security'
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Lock size={18} />
                                    Security
                                </button>
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-8">
                            {activeTab === 'details' && (
                                <form onSubmit={handleDetailsSubmit} className="space-y-6 max-w-lg">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-1">Profile Details</h2>
                                        <p className="text-sm text-gray-500">Update your personal information</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    value={formData.address}
                                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-colors shadow-lg shadow-indigo-200"
                                        >
                                            {loading ? 'Saving Changes...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'security' && (
                                <form onSubmit={handleSecuritySubmit} className="space-y-6 max-w-lg">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-1">Security Settings</h2>
                                        <p className="text-sm text-gray-500">Update your password to keep your account safe</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                            <input
                                                type="password"
                                                value={securityData.passwordCurrent}
                                                onChange={e => setSecurityData({ ...securityData, passwordCurrent: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                            <input
                                                type="password"
                                                value={securityData.password}
                                                onChange={e => setSecurityData({ ...securityData, password: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                required
                                                minLength={8}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={securityData.passwordConfirm}
                                                onChange={e => setSecurityData({ ...securityData, passwordConfirm: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                required
                                                minLength={8}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-colors shadow-lg shadow-indigo-200"
                                        >
                                            {loading ? 'Updating Password...' : 'Update Password'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
