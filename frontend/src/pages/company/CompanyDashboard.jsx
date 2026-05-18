import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Users, CheckCircle, Clock, Edit2, Trash2, Plus, ArrowRight, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import useAuth from '../../hooks/useAuth';

const CompanyDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [offers, setOffers] = useState([]);
    const [recentApplicants, setRecentApplicants] = useState([]);
    const [stats, setStats] = useState({ totalOffers: 0, totalApps: 0, accepted: 0, pending: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const offersRes = await axiosInstance.get('/offers/me');
                const appsRes = await axiosInstance.get('/applications');

                const dbOffers = offersRes.data;
                const dbApps = appsRes.data;

                // Format offers for table
                const formattedOffers = dbOffers.map(o => ({
                    id: o._id,
                    title: o.title,
                    type: o.type,
                    wilaya: o.location,
                    applicantsCount: dbApps.filter(a => a.offer?._id === o._id).length,
                    status: 'Active' // We don't have a status on Offer yet, so default to Active
                }));
                setOffers(formattedOffers);

                // Format recent applicants (last 5)
                const formattedApps = dbApps.slice(-5).reverse().map(app => ({
                    id: app._id,
                    name: `${app.student?.firstName || ''} ${app.student?.lastName || ''}`.trim() || 'Student',
                    offerTitle: app.offer?.title || 'Unknown Position',
                    date: app.createdAt,
                    status: app.status === 'refused' ? 'rejected' : app.status // keep frontend naming consistent with backend logic if possible, or map it
                }));
                setRecentApplicants(formattedApps);

                setStats({
                    totalOffers: dbOffers.length,
                    totalApps: dbApps.length,
                    accepted: dbApps.filter(a => a.status === 'accepted' || a.status === 'validated').length,
                    pending: dbApps.filter(a => a.status === 'pending').length
                });

                setLoading(false);
            } catch (err) {
                console.error("COMPANY DASHBOARD FETCH ERROR:", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAction = async (appId, action) => {
        try {
            const backendStatus = action === 'refused' ? 'rejected' : 'accepted';
            await axiosInstance.put(`/applications/${appId}`, { status: backendStatus });

            setRecentApplicants(prev =>
                prev.map(app => app.id === appId ? { ...app, status: backendStatus } : app)
            );
            toast.success(`Applicant ${action === 'accepted' ? 'Accepted' : 'Refused'}`);
        } catch (e) {
            console.error("ACTION ERROR:", e);
            toast.error('Action failed');
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            accepted: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20',
            validated: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20',
            refused: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20',
            rejected: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20',
            pending: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20'
        };
        const label = status === 'rejected' || status === 'refused' ? 'Refused' : status;
        return (
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.pending}`}>
                {label}
            </span>
        );
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
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-[#0F1C2E] dark:to-[#1E3A5F] border border-gray-200 dark:border-white/10 rounded-2xl p-8 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between transition-all duration-300">
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl mix-blend-screen opacity-50"></div>
                <div className="relative z-10 space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Dashboard Overview
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your offers and candidates effectively.</p>
                </div>
                <button
                    onClick={() => navigate('/company/offers')}
                    className="mt-6 sm:mt-0 relative z-10 flex items-center shrink-0 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-white font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                >
                    <Plus className="w-5 h-5 mr-2" /> Post New Offer
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-white/10 transition-all group shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Offers</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-blue-400 transition-colors">{stats.totalOffers}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 group-hover:scale-110 transition-transform"><ClipboardList className="w-6 h-6" /></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-white/10 transition-all group shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Applicants</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-purple-400 transition-colors">{stats.totalApps}</h3>
                        </div>
                        <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400 group-hover:scale-110 transition-transform"><Users className="w-6 h-6" /></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-white/10 transition-all group shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Accepted</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-green-400 transition-colors">{stats.accepted}</h3>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-lg text-green-400 group-hover:scale-110 transition-transform"><CheckCircle className="w-6 h-6" /></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-white/10 transition-all group shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Reviews</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-yellow-400 transition-colors">{stats.pending}</h3>
                        </div>
                        <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-400 group-hover:scale-110 transition-transform"><Clock className="w-6 h-6" /></div>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Active Offers */}
                <div className="xl:col-span-2 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-teal-500 dark:text-teal-400" /> Active Offers
                        </h2>
                        <button
                            onClick={() => navigate('/company/offers')}
                            className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors flex items-center"
                        >
                            View All <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>

                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-x-auto shadow-sm dark:shadow-none">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                            <thead className="bg-gray-50 dark:bg-[#0F1C2E]">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Offer Title</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type / Location</th>
                                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Applicants</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {offers.map((offer) => (
                                    <tr key={offer.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{offer.title}</div>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600 dark:text-gray-300">{offer.type}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-500">{offer.wilaya}</div>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white">
                                                {offer.applicantsCount}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${offer.status === 'Active' ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20' : 'bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20'
                                                }`}>
                                                {offer.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Applicants */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                            <Users className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" /> Recent Applicants
                        </h2>
                    </div>

                    <div className="flex flex-col gap-4">
                        {recentApplicants.map((app) => (
                            <div key={app.id} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex flex-col gap-3 shadow-sm dark:shadow-none">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg">
                                            {app.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{app.name}</h3>
                                            <p className="text-xs text-teal-600 dark:text-teal-400 font-medium truncate max-w-[150px]">{app.offerTitle}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={app.status} />
                                </div>

                                <div className="text-xs text-gray-500 flex items-center justify-between">
                                    <span>Applied: {new Date(app.date).toLocaleDateString()}</span>
                                </div>

                                {app.status === 'pending' && (
                                    <div className="flex gap-2 mt-1">
                                        <button
                                            onClick={() => handleAction(app.id, 'accepted')}
                                            className="flex-1 py-1.5 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold rounded border border-green-200 dark:border-green-500/20 transition-colors"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleAction(app.id, 'refused')}
                                            className="flex-1 py-1.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded border border-red-200 dark:border-red-500/20 transition-colors"
                                        >
                                            Refuse
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => navigate('/company/candidates')}
                        className="w-full mt-4 py-2 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm font-medium transition-colors shadow-sm dark:shadow-none"
                    >
                        Manage All Candidates
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CompanyDashboard;
