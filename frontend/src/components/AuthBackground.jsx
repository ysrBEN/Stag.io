import React from 'react';
import ThemeToggle from './ThemeToggle';

const AuthBackground = ({ children }) => {
    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#0F1C2E] dark:to-[#1E3A5F] flex flex-col items-center justify-center p-4 transition-colors duration-300">
            <div className="fixed top-6 right-6 z-50">
                <ThemeToggle />
            </div>
            {/* Background blobs */}
            <div className="blob bg-teal-500/20 w-96 h-96 top-0 left-0" style={{ animationDelay: '0s' }}></div>
            <div className="blob bg-blue-500/20 w-[600px] h-[600px] bottom-[-20%] right-[-10%]" style={{ animationDelay: '2s' }}></div>

            {/* Content wrapper */}
            <div className="relative z-10 w-full max-w-md fade-in-up">
                {children}
            </div>
        </div>
    );
};

export default AuthBackground;
