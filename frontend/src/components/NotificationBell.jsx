import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Clipboard, User, GraduationCap, Clock, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchUnreadCount = async () => {
        try {
            const res = await axiosInstance.get('/notifications/unread-count');
            setUnreadCount(res.data.count);
        } catch (err) {
            console.error("Error fetching unread count:", err);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id, relatedId, type) => {
        try {
            await axiosInstance.put(`/notifications/${id}/read`);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));

            // Navigate based on type
            if (type === 'new_application' || type === 'application_accepted' || type === 'application_refused' || type === 'internship_validated') {
                if (window.location.pathname.includes('/student')) navigate('/student/applications');
                else if (window.location.pathname.includes('/company')) navigate('/company/candidates');
                else if (window.location.pathname.includes('/admin')) navigate('/admin/validations');
            } else if (type === 'new_registration') {
                navigate('/admin/approvals');
            }

            setIsOpen(false);
        } catch (err) {
            console.error("Error marking as read:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axiosInstance.put('/notifications/read-all');
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error("Error marking all as read:", err);
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const getIcon = (type) => {
        switch (type) {
            case 'application_accepted': return <Check className="w-4 h-4 text-green-400" />;
            case 'application_refused': return <X className="w-4 h-4 text-red-400" />;
            case 'new_application': return <Clipboard className="w-4 h-4 text-blue-400" />;
            case 'new_registration': return <User className="w-4 h-4 text-purple-400" />;
            case 'internship_validated': return <GraduationCap className="w-4 h-4 text-teal-400" />;
            default: return <Bell className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative text-gray-400 hover:text-teal-400 transition-colors p-2 rounded-full hover:bg-white/5 outline-none"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#111827]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#1F2937] border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden animate-fade-in">
                    <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                        <h3 className="font-bold text-white text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[10px] text-teal-400 hover:text-teal-300 font-bold uppercase tracking-wider flex items-center"
                            >
                                <CheckCheck className="w-3 h-3 mr-1" /> Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500 text-sm">Loading...</div>
                        ) : notifications.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {notifications.map((n) => (
                                    <div
                                        key={n._id}
                                        onClick={() => markAsRead(n._id, n.relatedId, n.type)}
                                        className={`p-4 hover:bg-white/5 cursor-pointer transition-colors flex items-start space-x-3 ${!n.isRead ? 'bg-teal-500/5' : ''}`}
                                    >
                                        <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-white/10' : 'bg-white/5'}`}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs leading-relaxed ${!n.isRead ? 'text-white font-medium' : 'text-gray-400'}`}>
                                                {n.message}
                                            </p>
                                            <div className="flex items-center mt-1 text-[10px] text-gray-500">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {getTimeAgo(n.createdAt)}
                                            </div>
                                        </div>
                                        {!n.isRead && (
                                            <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 shrink-0"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center space-y-2">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                    <Bell className="w-6 h-6 text-gray-600" />
                                </div>
                                <p className="text-gray-500 text-sm italic">No notifications yet 🔔</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
