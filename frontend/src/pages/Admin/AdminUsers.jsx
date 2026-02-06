import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { User as UserIcon } from 'lucide-react';

const AdminUsers = () => {
    const { users, toggleUserStatus } = useAdmin();
    const [actionLoading, setActionLoading] = React.useState({});

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Community Members</h3>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Total: {users.length}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {users.filter(u => u.role !== 'ADMIN').map((user) => (
                    <div key={user._id || user.id} className="bg-white dark:bg-slate-900 p-5 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                                {user.profilePhoto ? (
                                    <img src={user.profilePhoto} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-6 h-6 text-slate-400" />
                                )}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white text-sm">{user.name}</h4>
                                <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                                <div className="flex gap-2 mt-1">
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${user.role === 'TECHNICIAN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {user.role}
                                    </span>
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {user.isActive ? 'Active' : 'Blocked'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={actionLoading[user._id || user.id]}
                            onClick={async () => {
                                if (window.confirm(`Are you sure you want to ${user.isActive ? 'BLOCK' : 'ACTIVATE'} this user?`)) {
                                    const id = user._id || user.id;
                                    setActionLoading(prev => ({ ...prev, [id]: true }));
                                    await toggleUserStatus(id, user.isActive);
                                    setActionLoading(prev => ({ ...prev, [id]: false }));
                                }
                            }}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 ${user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                        >
                            {actionLoading[user._id || user.id] ? 'Updating...' : (user.isActive ? 'Block User' : 'Activate User')}
                        </button>
                    </div>
                ))}
                {users.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        No users found
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
