import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const AuthBackground = ({ children }) => {
    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#0F1C2E] dark:to-[#1E3A5F] flex flex-col items-center justify-center p-4 transition-colors duration-300">
            <div className="fixed top-6 left-6 z-50">
                <Link 
                    to="/" 
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-sm transition-all hover:scale-105 duration-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour à l'accueil</span>
                </Link>
            </div>
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
