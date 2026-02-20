import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../components/layout/Footer';

const MainLayout = () => {
    const location = useLocation();
    const hideFooterPaths = ['/services', '/bookings'];
    const shouldShowFooter = !hideFooterPaths.some(path => location.pathname.startsWith(path));

    return (
        <div className="min-h-screen flex flex-col font-sans text-slate-900 dark:text-white bg-transparent dark:bg-slate-950 transition-colors duration-300">
            <main className="grow">
                <Outlet />
            </main>

            {shouldShowFooter && (
                <div className="hidden md:block">
                    <Footer />
                </div>
            )}
        </div>
    );
};

export default MainLayout;
