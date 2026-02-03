import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
    Shield, Users, Briefcase, DollarSign,
    CheckCircle, XCircle, Clock, Search,
    AlertCircle, Activity, ChevronRight
} from 'lucide-react';
import Button from '../../components/ui/Button';
import DocumentModel from '../../components/Admin/DocumentModel';
import { getMediaUrl } from '../../utils/media';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, technicians, users, bookings, services
    const [technicians, setTechnicians] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [selectedTechForDocs, setSelectedTechForDocs] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/admin/dashboard-stats');
            setStats(data.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch admin stats');
            setLoading(false);
        }
    };

    const fetchTechnicians = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/technicians');
            setTechnicians(data.data.technicians);
        } catch (error) {
            toast.error('Failed to fetch technicians');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/users');
            setUsersList(data.data.users);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveTech = async (id) => {
        setIsActionLoading(true);
        try {
            await api.patch(`/admin/technicians/${id}/approve`);
            toast.success('Technician approved!');
            fetchTechnicians();
            fetchStats();
        } catch (error) {
            toast.error('Approval failed');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRejectTech = async (id) => {
        if (!window.confirm('Are you sure you want to REJECT this technician?')) return;
        setIsActionLoading(true);
        try {
            await api.patch(`/admin/technicians/${id}/reject`);
            toast.success('Technician rejected');
            fetchTechnicians();
            fetchStats();
        } catch (error) {
            toast.error('Rejection failed');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleToggleUserStatus = async (id, currentStatus) => {
        const action = currentStatus ? 'BLOCK' : 'ACTIVATE';
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

        setIsActionLoading(true);
        try {
            await api.patch(`/admin/users/${id}/status`, { isActive: !currentStatus });
            toast.success(`User ${action === 'BLOCK' ? 'blocked' : 'activated'}!`);
            fetchUsers();
            fetchStats();
        } catch (error) {
            toast.error('Failed to update user status');
        } finally {
            setIsActionLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'technicians') fetchTechnicians();
        if (activeTab === 'users') fetchUsers();
    }, [activeTab]);

    if (loading && !stats) return <div className="p-20 text-center font-black italic tracking-widest text-indigo-600 animate-pulse">INITIATING COMMAND...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Admin Header */}
            <div className="bg-indigo-900 text-white py-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-800 skew-x-12 translate-x-1/2 opacity-50"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="text-indigo-400" size={24} />
                                <span className="text-indigo-200 font-bold tracking-widest text-xs uppercase">Platform Command Center</span>
                            </div>
                            <h1 className="text-4xl font-black italic tracking-tighter">ADMIN CORE</h1>
                            <p className="text-indigo-300 mt-2 font-medium">System operational - Monitoring all nodes</p>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10">
                                <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-1">Live Bookings</p>
                                <p className="text-3xl font-black text-white">{stats?.todaysBookings}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Total Users', val: stats?.totalUsers, color: 'blue', icon: Users },
                        { label: 'Technicians', val: stats?.totalTechnicians, color: 'indigo', icon: Briefcase },
                        { label: 'Active Services', val: stats?.totalServices, color: 'purple', icon: Activity },
                        { label: 'Pending Review', val: stats?.pendingApprovals, color: 'orange', icon: AlertCircle, highlight: stats?.pendingApprovals > 0 },
                    ].map((s, i) => (
                        <div key={i} className={`bg-white p-6 rounded-3xl shadow-xl shadow-indigo-100/50 border ${s.highlight ? 'border-orange-400 ring-2 ring-orange-100' : 'border-gray-100'} hover:scale-105 transition-transform duration-300`}>
                            <div className={`p-3 bg-${s.color}-50 text-${s.color}-600 w-fit rounded-2xl mb-4`}>
                                <s.icon size={24} />
                            </div>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-tight">{s.label}</p>
                            <h3 className="text-3xl font-black text-gray-900 mt-1">{s.val}</h3>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden mb-20">
                    {/* Dark Tabs */}
                    <div className="flex overflow-x-auto bg-gray-900 p-2 gap-1 scrollbar-hide">
                        {[
                            { id: 'overview', label: 'Monitor', icon: Activity },
                            { id: 'technicians', label: 'Verifications', icon: Shield, badge: stats?.pendingApprovals },
                            { id: 'users', label: 'User Hub', icon: Users },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                                {tab.badge > 0 && (
                                    <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-8 md:p-12">
                        {activeTab === 'overview' && (
                            <div className="text-center py-24">
                                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                                    <Activity size={48} />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 italic uppercase tracking-widest">System Operational</h2>
                                <p className="text-gray-500 mt-2 max-w-sm mx-auto font-medium">
                                    All core services are communicating. No critical errors detected in the last 24 hours.
                                </p>
                            </div>
                        )}

                        {activeTab === 'technicians' && (
                            <div className="animate-fade-in">
                                <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3 uppercase italic">
                                    <Shield className="text-indigo-600" size={24} />
                                    Reviewing {technicians.length} Technicians
                                </h3>

                                <div className="grid grid-cols-1 gap-4">
                                    {technicians.length > 0 ? (
                                        technicians.map((tech) => (
                                            <div key={tech._id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col lg:flex-row justify-between lg:items-center gap-6 hover:bg-white hover:shadow-lg transition-all duration-300">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-200 shadow-inner">
                                                        <img
                                                            src={getMediaUrl(tech.user?.profilePhoto || tech.profilePhoto)}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${tech.user?.name}&background=random`; }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-gray-900 uppercase italic leading-none mb-1">{tech.user?.name}</h4>
                                                        <p className="text-sm text-gray-500 font-medium">{tech.user?.email}</p>
                                                        <div className="flex gap-2 mt-2">
                                                            <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-widest ${tech.documents?.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                                                                tech.documents?.verificationStatus === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                                                }`}>{tech.documents?.verificationStatus}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-3">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => handleApproveTech(tech._id)}
                                                            disabled={isActionLoading}
                                                            className={`${tech.documents?.verificationStatus === 'VERIFIED' ? 'bg-indigo-600 opacity-50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} rounded-xl font-black italic tracking-widest text-[10px] uppercase shadow-lg shadow-green-500/20`}
                                                        >
                                                            {tech.documents?.verificationStatus === 'VERIFIED' ? 'Already Verified' : 'Approve Documents'}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            disabled={isActionLoading}
                                                            onClick={() => handleRejectTech(tech._id)}
                                                            className={`${tech.documents?.verificationStatus === 'REJECTED' ? 'bg-red-50 text-red-300 opacity-50' : 'text-red-600 border-red-100 hover:bg-red-50'} rounded-xl font-black italic tracking-widest text-[10px] uppercase`}
                                                        >
                                                            {tech.documents?.verificationStatus === 'REJECTED' ? 'Already Rejected' : 'Reject'}
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => setSelectedTechForDocs(tech)}
                                                        className="rounded-xl font-black italic tracking-widest text-[10px] uppercase"
                                                    >
                                                        Review Profile
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                                            <p className="text-gray-400 font-bold uppercase tracking-widest italic">No technicians in system</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="animate-fade-in">
                                <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3 uppercase italic">
                                    <Users className="text-indigo-600" size={24} />
                                    Community Access Control
                                </h3>

                                <div className="grid grid-cols-1 gap-4">
                                    {usersList.filter(u => u.role !== 'ADMIN').length > 0 ? (
                                        usersList.filter(u => u.role !== 'ADMIN').map((u) => (
                                            <div key={u._id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col lg:flex-row justify-between lg:items-center gap-6 hover:bg-white hover:shadow-lg transition-all duration-300">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-inner flex items-center justify-center border border-gray-100">
                                                        <img
                                                            src={getMediaUrl(u.profilePhoto)}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${u.name}&background=random`; }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-gray-900 uppercase italic leading-none mb-1">{u.name}</h4>
                                                        <p className="text-sm text-gray-500 font-medium">{u.email}</p>
                                                        <div className="flex gap-2 mt-2">
                                                            <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-widest ${u.role === 'TECHNICIAN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                                }`}>{u.role}</span>
                                                            <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-widest ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                                                                }`}>{u.isActive ? 'Active' : 'Account Blocked'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <Button
                                                        variant={u.isActive ? "outline" : "primary"}
                                                        disabled={isActionLoading}
                                                        onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                                                        className={`rounded-xl font-black italic tracking-widest text-[10px] uppercase ${u.isActive ? 'text-red-600 border-red-100 hover:bg-red-50' : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20'
                                                            }`}
                                                    >
                                                        {u.isActive ? 'Block Access' : 'Restore Access'}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                                            <p className="text-gray-400 font-bold uppercase tracking-widest italic">User list is empty</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Document Viewer Modal */}
            {selectedTechForDocs && (
                <DocumentModel
                    tech={selectedTechForDocs}
                    onClose={() => setSelectedTechForDocs(null)}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
