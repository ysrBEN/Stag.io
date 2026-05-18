import { useState, useEffect } from 'react';
import { Users, GraduationCap, Check, X as XIcon, GitBranch, MapPin, Loader2, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import { generateConvention } from '../../utils/generateConvention';

const Candidates = () => {
    const [loading, setLoading] = useState(true);
    const [offers, setOffers] = useState([]);
    const [selectedOfferId, setSelectedOfferId] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [coverLetterModal, setCoverLetterModal] = useState({ open: false, text: '', name: '' });

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const res = await axiosInstance.get('/offers/me');
                const fetchedOffers = res.data.map(o => ({
                    id: o._id,
                    title: o.title
                }));
                setOffers(fetchedOffers);
                if (fetchedOffers.length > 0) {
                    setSelectedOfferId(fetchedOffers[0].id);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error("OFFERS FETCH ERROR:", err);
                toast.error('Failed to load offers');
                setLoading(false);
            }
        };
        fetchOffers();
    }, []);

    useEffect(() => {
        if (selectedOfferId) {
            const fetchCandidates = async () => {
                setLoading(true);
                try {
                    const res = await axiosInstance.get(`/company/offers/${selectedOfferId}/applications`);
                    const offerApps = res.data;

                    const formatted = offerApps.map(app => ({
                        id: app._id,
                        name: `${app.student?.user?.name || 'Student'}`.trim(),
                        avatar: (app.student?.user?.name || 'S').charAt(0),
                        university: app.student?.university || 'University',
                        year: app.student?.academicYear || 'Year',
                        skills: (app.student?.user?.skills || app.student?.skills) || [],
                        github: app.student?.user?.githubUrl || '',
                        status: app.status,
                        coverLetter: app.coverLetter || '',
                        hasOverlap: app.hasOverlap || false
                    }));

                    setCandidates(formatted);
                    setLoading(false);
                } catch (e) {
                    console.error("CANDIDATES FETCH ERROR:", e);
                    toast.error('Failed to load candidates');
                    setLoading(false);
                }
            };
            fetchCandidates();
        }
    }, [selectedOfferId]);

    const handleDownloadConvention = async (appId) => {
        try {
            const res = await axiosInstance.get(`/applications/${appId}/convention`);
            generateConvention(res.data);
        } catch (err) {
            console.error("PDF ERROR:", err);
            toast.error('Failed to generate PDF');
        }
    };

    const handleAction = async (candidateId, action) => {
        try {
            const backendStatus = action === 'refused' ? 'rejected' : 'accepted';
            await axiosInstance.put(`/applications/${candidateId}`, { status: backendStatus });

            setCandidates(prev =>
                prev.map(c => c.id === candidateId ? { ...c, status: backendStatus } : c)
            );
            toast.success(action === 'accepted' ? 'Candidate Accepted! Notification sent.' : 'Candidate Refused.');
        } catch (e) {
            console.error("CANDIDATE ACTION ERROR:", e);
            toast.error('Action failed');
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            accepted: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20',
            validated: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20',
            rejected: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20',
            refused: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20',
            pending: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20'
        };
        const label = status === 'rejected' || status === 'refused' ? 'Refused' : status;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${styles[status] || styles.pending}`}>
                {label}
            </span>
        );
    };

    return (
        <>
            <div className="space-y-6 fade-in-up">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                            <Users className="w-6 h-6 mr-3 text-teal-600 dark:text-teal-400" /> Review Candidates
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Select an offer to review incoming student applications</p>
                    </div>
                </div>

                {offers.length === 0 && !loading && (
                    <div className="text-center py-20 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none">
                        <p className="text-gray-500 dark:text-gray-400">You must post an offer first to see candidates.</p>
                    </div>
                )}

                {offers.length > 0 && (
                    <>
                        {/* Offer Tabs */}
                        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-white/10 pb-px hide-scrollbar">
                            {offers.map(offer => (
                                <button
                                    key={offer.id}
                                    onClick={() => setSelectedOfferId(offer.id)}
                                    className={`flex items-center px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${selectedOfferId === offer.id
                                        ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20'
                                        }`}
                                >
                                    {offer.title}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex h-64 items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
                                </div>
                            ) : candidates.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {candidates.map(candidate => (
                                        <div key={candidate.id} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 hover:border-gray-300 dark:hover:border-white/20 transition-all flex flex-col pt-6 relative group h-full shadow-sm dark:shadow-none">

                                            <div className="absolute top-4 right-4">
                                                <StatusBadge status={candidate.status} />
                                            </div>

                                            <div className="flex items-center space-x-4 mb-4">
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg border-2 border-white dark:border-[#0F1C2E]">
                                                    {candidate.avatar}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{candidate.name}</h3>
                                                    <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">Applied recently</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-4 text-sm">
                                                <p className="flex items-center text-gray-600 dark:text-gray-300">
                                                    <GraduationCap className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                                                    {candidate.university} <span className="mx-2 text-gray-200 dark:text-white/20">|</span> <span className="font-bold text-gray-900 dark:text-white">{candidate.year}</span>
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5 mb-6">
                                                {candidate.skills.map(s => (
                                                    <span key={s} className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded text-[10px] uppercase font-bold tracking-wider border border-gray-200 dark:border-white/10">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="mt-auto space-y-4">
                                                {/* Cover Letter */}
                                                {candidate.coverLetter ? (
                                                    <button
                                                        onClick={() => setCoverLetterModal({ open: true, text: candidate.coverLetter, name: candidate.name })}
                                                        className="flex items-center justify-center w-full py-2 bg-gray-50 dark:bg-[#0F1C2E] border border-teal-500/30 rounded-lg text-sm text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-500/10 hover:border-teal-500/60 transition-colors"
                                                    >
                                                        <FileText className="w-4 h-4 mr-2" /> View Cover Letter
                                                    </button>
                                                ) : (
                                                    <p className="text-center text-xs text-gray-500 py-1">No cover letter provided</p>
                                                )}
                                                {candidate.github && (
                                                    <a
                                                        href={candidate.github}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center w-full py-2 bg-gray-50 dark:bg-[#0F1C2E] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-teal-500/50 transition-colors"
                                                    >
                                                        <GitBranch className="w-4 h-4 mr-2 text-gray-400" /> GitHub Profile
                                                    </a>
                                                )}

                                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
                                                    {candidate.status === 'validated' ? (
                                                        <button
                                                            onClick={() => handleDownloadConvention(candidate.id)}
                                                            className="col-span-2 flex items-center justify-center py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-bold transition-all shadow-[0_0_10px_rgba(20,184,166,0.3)]"
                                                        >
                                                            <Download className="w-4 h-4 mr-2" /> Download Convention
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                disabled={candidate.status !== 'pending' || candidate.hasOverlap}
                                                                onClick={() => handleAction(candidate.id, 'accepted')}
                                                                className={`flex items-center justify-center py-2.5 rounded-lg text-sm font-bold transition-all ${candidate.status !== 'pending' || candidate.hasOverlap
                                                                    ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-white/5'
                                                                    : 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_10px_rgba(22,163,74,0.3)]'
                                                                    }`}
                                                            >
                                                                <Check className="w-4 h-4 mr-1.5" /> Accept
                                                            </button>
                                                            <button
                                                                disabled={candidate.status !== 'pending'}
                                                                onClick={() => handleAction(candidate.id, 'refused')}
                                                                className={`flex items-center justify-center py-2.5 rounded-lg text-sm font-bold transition-all ${candidate.status !== 'pending'
                                                                    ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-white/5'
                                                                    : 'bg-red-600/80 hover:bg-red-600 text-white border border-red-500/50'
                                                                    }`}
                                                            >
                                                                <XIcon className="w-4 h-4 mr-1.5" /> Refuse
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                                {candidate.hasOverlap && candidate.status === 'pending' && (
                                                    <div className="mt-3 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 p-2 rounded-lg text-center border border-amber-200 dark:border-amber-500/20">
                                                        ⚠️ Student already placed for these dates
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none">
                                    <Users className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No candidates yet</h3>
                                    <p className="text-gray-500 dark:text-gray-400">Applications for this offer will appear here.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Cover Letter View Modal */}
            {coverLetterModal.open && (
                <div className="fixed inset-0 z-[90] flex justify-center items-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0F1C2E] border border-gray-200 dark:border-white/10 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Cover Letter
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">from <span className="text-gray-700 dark:text-gray-300 font-medium">{coverLetterModal.name}</span></p>
                            </div>
                            <button
                                onClick={() => setCoverLetterModal({ open: false, text: '', name: '' })}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{coverLetterModal.text}</p>
                        </div>
                        <div className="px-6 pb-5 pt-3 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-transparent">
                            <button
                                onClick={() => setCoverLetterModal({ open: false, text: '', name: '' })}
                                className="w-full py-2.5 rounded-lg bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Candidates;

