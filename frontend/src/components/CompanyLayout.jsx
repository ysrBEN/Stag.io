import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, ClipboardList, Users, Building2,
    LogOut, Menu, X, Bell
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

const CompanyLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { name: 'Dashboard', path: '/company/dashboard', icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
        { name: 'My Offers', path: '/company/offers', icon: <ClipboardList className="w-5 h-5 mr-3" /> },
        { name: 'Candidates', path: '/company/candidates', icon: <Users className="w-5 h-5 mr-3" /> },
        { name: 'Company Profile', path: '/company/profile', icon: <Building2 className="w-5 h-5 mr-3" /> },
    ];

    const NavItem = ({ link, onClick }) => (
        <NavLink
            to={link.path}
            onClick={onClick}
            className={({ isActive }) =>
                `flex items-center px-4 py-3 my-1 rounded-r-lg transition-all border-l-4 ${isActive
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 font-medium'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                }`
            }
        >
            {link.icon}
            {link.name}
        </NavLink>
    );

    return (
        <div className="min-h-screen bg-white dark:bg-[#111827] flex font-sans transition-colors duration-300">

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full h-16 bg-white dark:bg-[#0F1C2E] border-b border-gray-200 dark:border-white/10 z-50 flex items-center justify-between px-4 transition-colors duration-300">
                <button onClick={() => setMobileMenuOpen(true)} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-2 text-gray-900 dark:text-white font-bold text-xl">
                    <Building2 className="w-6 h-6 text-teal-400" />
                    <span>Stag.io</span>
                </div>
                <div className="flex items-center space-x-2">
                    <ThemeToggle />
                    <NotificationBell />
                </div>
            </div>

            {/* Mobile Drawer Overlay */}
            {mobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar Navigation */}
            <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#0F1C2E] border-r border-gray-200 dark:border-white/10 transform transition-all duration-300 ease-in-out flex flex-col
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex-shrink-0
      `}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-white/10 shrink-0">
                    <div className="flex items-center space-x-2 text-gray-900 dark:text-white font-bold text-2xl tracking-tight">
                        <Building2 className="w-8 h-8 text-teal-400" />
                        <span>Stag.io</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 pr-4">
                    <nav className="space-y-1">
                        {navLinks.map((link) => (
                            <NavItem key={link.path} link={link} onClick={() => setMobileMenuOpen(false)} />
                        ))}
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-white/10 shrink-0">
                    <div className="flex items-center px-2 py-2 mb-4">
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-teal-500 text-white font-bold text-xl shrink-0 overflow-hidden">
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                user?.name?.charAt(0).toUpperCase() || 'C'
                            )}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name || 'Company Name'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Recruiter</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md z-40 items-center justify-end px-8 border-b border-gray-200 dark:border-white/5 space-x-4">
                <ThemeToggle />
                <NotificationBell />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative pt-16 md:pt-16 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto py-8 fade-in-up">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default CompanyLayout;
