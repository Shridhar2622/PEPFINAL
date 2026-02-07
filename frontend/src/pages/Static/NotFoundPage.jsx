import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-12 h-12 text-rose-500" />
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">404</h1>
            <p className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-8 max-w-md">
                The page you're looking for doesn't exist or has been moved to another coordinate.
            </p>

            <Link
                to="/"
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
                <Home className="w-5 h-5" /> Return Home
            </Link>
        </div>
    );
};

export default NotFoundPage;
