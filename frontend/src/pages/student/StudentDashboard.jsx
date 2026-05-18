import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, CheckCircle, Clock, XCircle, MapPin, Code, ArrowRight } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import useAuth from '../../hooks/useAuth';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ sent: 0, accepted: 0, pending: 0, refused: 0 });
    const [recentApps, setRecentApps] = useState([]);
    const [recommended, setRecommended] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch applications to calculate stats and show recent
                const appsRes = await axiosInstance.get('/applications/my');
                const apps = appsRes.data;

                const newStats = {
                    sent: apps.length,
                    accepted: apps.filter(a => a.status === 'accepted' || a.status === 'validated').length,
                    pending: apps.filter(a => a.status === 'pending').length,
                    refused: apps.filter(a => a.status === 'rejected' || a.status === 'refused' || a.status === 'refused_admin').length
                };
                setStats(newStats);

                // Format recent apps (taking last 5)
                const formattedApps = apps.slice(-5).reverse().map(app => ({
                    id: app._id,
                    company: app.offer?.company?.name || 'Unknown',
                    title: app.offer?.title || 'Unknown Position',
                    date: app.createdAt,
                    status: (app.status === 'rejected' || app.status === 'refused_admin') ? 'refused' : app.status
                }));
                setRecentApps(formattedApps);

                // Fetch offers for recommendations (Top 3 matches)
                const offersRes = await axiosInstance.get('/offers?sortBy=match');
                const topOffers = offersRes.data.slice(0, 3).map(offer => ({
                    id: offer._id,
                    company: offer.company?.name || 'Company',
                    title: offer.title,
                    location: offer.location,
                    skills: offer.technologies || [],
                    matchScore: offer.matchScore || 0
                }));
                setRecommended(topOffers);

                setLoading(false);
            } catch (err) {
                console.error("DASHBOARD FETCH ERROR:", err);
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'validated':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">Validated</span>;
            case 'accepted':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Accepted</span>;
            case 'refused':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Refused</span>;
            case 'pending':
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Pending</span>;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-24 bg-white/5 animate-pulse rounded-2xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-xl"></div>)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-64 bg-white/5 animate-pulse rounded-xl"></div>
                    <div className="h-64 bg-white/5 animate-pulse rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 fade-in-up">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-teal-500/10 to-transparent dark:from-teal-500/20 dark:to-[#111827] border border-teal-500/20 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl mix-blend-screen opacity-50"></div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
                    Welcome back, {user?.name || 'Student'} 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Here's what's happening with your internship search</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-xl p-6 hover:border-teal-500/30 dark:hover:bg-white/10 transition-all group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sent</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-teal-400 transition-colors">{stats.sent}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 group-hover:scale-110 transition-transform"><Send className="w-6 h-6" /></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-xl p-6 hover:border-green-500/30 dark:hover:bg-white/10 transition-all group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Accepted</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-green-400 transition-colors">{stats.accepted}</h3>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-lg text-green-400 group-hover:scale-110 transition-transform"><CheckCircle className="w-6 h-6" /></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-xl p-6 hover:border-yellow-500/30 dark:hover:bg-white/10 transition-all group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-yellow-400 transition-colors">{stats.pending}</h3>
                        </div>
                        <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-400 group-hover:scale-110 transition-transform"><Clock className="w-6 h-6" /></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-xl p-6 hover:border-red-500/30 dark:hover:bg-white/10 transition-all group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Refused</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-red-400 transition-colors">{stats.refused}</h3>
                        </div>
                        <div className="p-3 bg-red-500/10 rounded-lg text-red-400 group-hover:scale-110 transition-transform"><XCircle className="w-6 h-6" /></div>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Recent Applications */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Applications</h2>
                        <button
                            onClick={() => navigate('/student/applications')}
                            className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
                        >
                            View All
                        </button>
                    </div>
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-xl overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                            <thead className="bg-gray-50 dark:bg-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Offer Title</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                                {recentApps.map((app) => (
                                    <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{app.company}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{app.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(app.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(app.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {recentApps.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                No applications found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Recommended Offers */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        🎯 Best Matches for You
                    </h2>
                    <div className="grid gap-4">
                        {recommended.length > 0 && recommended.some(o => o.matchScore > 0) ? (
                            recommended.map((offer) => (
                                <div key={offer.id} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-xl p-5 hover:border-teal-500/50 hover:-translate-y-1 transition-all group relative overflow-hidden">
                                    {offer.matchScore > 0 && (
                                        <div className="absolute top-0 right-0 px-3 py-1 bg-teal-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-lg shadow-lg">
                                            {offer.matchScore}% Match
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-teal-400 transition-colors pr-12">{offer.title}</h3>
                                        {!offer.matchScore && <div className="h-8 w-8 rounded-md bg-white/10 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-teal-400">{offer.company.charAt(0)}</div>}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{offer.company}</p>
                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                                        <MapPin className="w-3.5 h-3.5 mr-1" /> {offer.location}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-5">
                                        {offer.skills.slice(0, 3).map((skill, i) => (
                                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/5">
                                                <Code className="w-3 h-3 mr-1" /> {skill}
                                            </span>
                                        ))}
                                        {offer.skills.length > 3 && <span className="text-[10px] text-gray-500">+{offer.skills.length - 3} more</span>}
                                    </div>
                                    <button
                                        onClick={() => navigate('/student/search')}
                                        className="w-full flex items-center justify-center py-2 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 text-sm font-medium transition-colors"
                                    >
                                        View Details <ArrowRight className="w-4 h-4 ml-2" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white dark:bg-gradient-to-br dark:from-white/5 dark:to-transparent border border-gray-200 dark:border-white/10 rounded-xl p-8 text-center space-y-4 shadow-sm dark:shadow-none">
                                <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto text-teal-400 mb-2">
                                    <Code className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 dark:text-white font-bold mb-1">Scale your matching</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Add skills to your profile to see personalized internship matches!</p>
                                </div>
                                <button
                                    onClick={() => navigate('/student/profile')}
                                    className="w-full py-2.5 rounded-lg bg-teal-500 text-white text-sm font-bold shadow-lg shadow-teal-500/20 hover:scale-[1.02] transition-all"
                                >
                                    Complete Profile →
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StudentDashboard;
