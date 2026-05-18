import { useState, useEffect } from 'react';
import { Download, Building2, Calendar, FileText, CheckCircle, XCircle } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { generateConvention } from '../../utils/generateConvention';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchApplications = async () => {
            setLoading(true);
            try {
                const res = await axiosInstance.get('/applications/my');
                const formatted = res.data.map(app => ({
                    id: app._id,
                    company: app.offer?.company?.name || 'Unknown',
                    title: app.offer?.title || 'Unknown Position',
                    date: app.createdAt,
                    status: app.status === 'rejected' ? 'refused' : app.status,
                    refusalReason: app.refusalReason,
                    pdfReady: app.status === 'validated'
                }));
                setApplications(formatted);
                setLoading(false);
            } catch (err) {
                console.error("APPLICATIONS FETCH ERROR:", err);
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    const handleDownloadConvention = async (appId) => {
        try {
            const res = await axiosInstance.get(`/applications/${appId}/convention`);
            generateConvention(res.data);
        } catch (err) {
            console.error("PDF ERROR:", err);
            alert("Failed to generate PDF. Please try again later.");
        }
    };

    const counts = {
        all: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        accepted: applications.filter(a => a.status === 'accepted').length,
        refused: applications.filter(a => a.status === 'refused').length,
    };

    const filteredApps = filter === 'all' ? applications : applications.filter(a => a.status === filter);

    const StatusBadge = ({ status, refusalReason }) => {
        const isClosed = status === 'refused' && refusalReason === 'placed_elsewhere';

        const styles = {
            accepted: 'bg-green-500/10 text-green-400 border-green-500/20',
            validated: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
            refused: isClosed ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20',
            pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
        };
        const labels = {
            accepted: 'Accepted',
            validated: 'Validated',
            refused: isClosed ? 'Closed' : 'Refused',
            pending: 'Pending'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${styles[status]}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="space-y-6 fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Applications</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Track the status of your internship applications</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-gray-200 dark:border-white/10 pb-px hide-scrollbar">
                {['all', 'pending', 'accepted', 'refused'].map(t => (
                    <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`flex items-center px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${filter === t
                            ? 'border-teal-500 text-teal-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20'
                            }`}
                    >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === t ? 'bg-teal-500/20' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400'}`}>
                            {counts[t]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Applications List */}
            <div className="space-y-4">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-32 bg-white dark:bg-white/5 animate-pulse rounded-xl"></div>)
                ) : filteredApps.length > 0 ? (
                    filteredApps.map(app => (
                        <div key={app.id} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm dark:shadow-none">
                            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xl shrink-0">
                                        {app.company.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{app.title}</h3>
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1 space-x-3">
                                            <span className="flex items-center"><Building2 className="w-4 h-4 mr-1" /> {app.company}</span>
                                            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> Applied on {new Date(app.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="shrink-0 flex items-center self-start sm:self-auto">
                                    <StatusBadge status={app.status} refusalReason={app.refusalReason} />
                                </div>
                            </div>

                            {/* Status Specific Banners */}
                            {app.status === 'validated' && (
                                <div className="mt-4 p-4 rounded-lg bg-teal-500/10 border border-teal-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="text-sm">
                                        <p className="font-semibold text-teal-600 dark:text-teal-400 flex items-center">🎉 Your internship has been officially validated!</p>
                                        <p className="text-teal-600 dark:text-teal-300/80 mt-1 text-xs">You can now download your official convention de stage.</p>
                                    </div>
                                    <button
                                        onClick={() => handleDownloadConvention(app.id)}
                                        className="flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold rounded-lg transition-all border border-teal-500 shrink-0 shadow-[0_0_10px_rgba(20,184,166,0.3)] hover:scale-[1.02]"
                                    >
                                        <Download className="w-4 h-4 mr-2" /> Download Convention
                                    </button>
                                </div>
                            )}

                            {app.status === 'accepted' && (
                                <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="text-sm">
                                        <p className="font-semibold text-green-600 dark:text-green-400 flex items-center shrink-0">
                                            <CheckCircle className="w-4 h-4 mr-2" /> Internship Accepted
                                        </p>
                                        <p className="text-green-600 dark:text-green-300/80 mt-1">Pending final validation by the administration.</p>
                                    </div>
                                </div>
                            )}

                            {app.status === 'refused' && (
                                <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-sm text-gray-500 dark:text-gray-400 italic font-medium">
                                    {app.refusalReason === 'placed_elsewhere' ? (
                                        <span className="flex items-center text-gray-500 dark:text-gray-400">
                                            <XCircle className="w-4 h-4 mr-2" /> Automatically closed — you were already placed in another internship.
                                        </span>
                                    ) : (
                                        "Note: The company decided to proceed with other candidates for this position."
                                    )}
                                </div>
                            )}

                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm dark:shadow-none">
                        <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No applications found</h3>
                        <p className="text-gray-500 dark:text-gray-400">You haven't applied to any internships yet in this category.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default MyApplications;
