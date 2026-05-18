import { useState, useEffect } from 'react';
import { Search, MapPin, Filter, X, Briefcase, Calendar, ChevronRight, XCircle, CheckCircle, FileText, Loader2, Copy, Download, PenTool, RefreshCw } from 'lucide-react';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';

import { ALGERIAN_WILAYAS } from '../../constants/wilayas';

const COMMON_SKILLS = ["React", "Node.js", "Python", "Java", "Laravel", "Django", "Flutter", "SQL", "MongoDB"];

const formatDateSafe = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB');
};

const InternshipSearch = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [coverLetterState, setCoverLetterState] = useState({
        isOpen: false,
        loading: false,
        content: '',
        editable: false
    });

    // Apply with cover letter
    const [applyModal, setApplyModal] = useState({ open: false, offer: null });
    const [coverLetter, setCoverLetter] = useState('');
    const [aiGenerating, setAiGenerating] = useState(false);
    const [coverLetterWarning, setCoverLetterWarning] = useState(false);

    // Filters
    const [keyword, setKeyword] = useState('');
    const [wilaya, setWilaya] = useState('');
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [type, setType] = useState('');
    const [sortBy, setSortBy] = useState('match');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch offers with filters
                const offersRes = await axiosInstance.get('/offers', {
                    params: {
                        keyword: keyword || undefined,
                        location: wilaya || undefined,
                        type: type || undefined,
                        skills: selectedSkills.length > 0 ? selectedSkills.join(',') : undefined,
                        sortBy: sortBy
                    }
                });

                // Fetch my applications to mark 'applied'
                const appsRes = await axiosInstance.get('/applications/my');
                const myAppOfferIds = appsRes.data.map(app => app.offer?._id);

                const formattedOffers = offersRes.data.map(offer => ({
                    id: offer._id,
                    title: offer.title,
                    company: offer.company?.name || 'Unknown Company',
                    wilaya: offer.location,
                    type: offer.type,
                    workMode: offer.workMode || 'on-site',
                    duration: offer.duration,
                    startDate: offer.startDate,
                    endDate: offer.endDate,
                    skills: offer.technologies || [],
                    desc: offer.description,
                    applied: myAppOfferIds.includes(offer._id),
                    matchScore: offer.matchScore || 0,
                    matchCount: offer.matchCount || 0,
                    studentSkills: offer.studentSkills || []
                }));

                setOffers(formattedOffers);
                setLoading(false);
            } catch (e) {
                console.error("SEARCH FETCH ERROR:", e);
                setLoading(false);
            }
        };
        fetchData();
    }, [keyword, wilaya, selectedSkills, type, sortBy]);

    const toggleSkill = (skill) => {
        setSelectedSkills(prev =>
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
    };

    const resetFilters = () => {
        setKeyword('');
        setWilaya('');
        setSelectedSkills([]);
        setType('');
    };

    const handleApply = async (offerId, letter) => {
        try {
            await axiosInstance.post('/applications', { offerId, coverLetter: letter });
            toast.success("Successfully applied for this internship!");

            // Update local state
            setOffers(prev => prev.map(o => o.id === offerId ? { ...o, applied: true } : o));
            setSelectedOffer(prev => prev && prev.id === offerId ? { ...prev, applied: true } : prev);
        } catch (err) {
            console.error("APPLY ERROR:", err);
            let msg = err.response?.data?.message || err.response?.data || "Failed to apply. Please try again.";
            if (typeof msg !== 'string') msg = "Failed to apply due to an error.";
            toast.error(msg);
        }
    };

    const handleAIGenerate = async (offerId) => {
        setAiGenerating(true);
        setCoverLetter(''); // Clear first
        setCoverLetterWarning(false);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://stag-io-b8nn.onrender.com/api/ai/cover-letter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ offerId })
            });

            if (!response.ok) throw new Error('Generation failed');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

                for (const line of lines) {
                    const data = line.replace('data: ', '').trim();
                    if (data === '[DONE]') break;
                    try {
                        const { token: aiToken } = JSON.parse(data);
                        setCoverLetter(prev => prev + aiToken);
                    } catch (e) {
                        // Malformed JSON
                    }
                }
            }
        } catch (err) {
            console.error("AI GENERATE ERROR:", err);
            toast.error('Failed to generate cover letter with AI.');
        } finally {
            setAiGenerating(false);
        }
    };

    const openApplyModal = (offer) => {
        setCoverLetter('');
        setCoverLetterWarning(false);
        setApplyModal({ open: true, offer });
    };

    const closeApplyModal = () => {
        setApplyModal({ open: false, offer: null });
        setCoverLetter('');
        setCoverLetterWarning(false);
    };

    const submitApplication = async () => {
        if (!coverLetter.trim()) {
            setCoverLetterWarning(true);
            return;
        }
        const offerId = applyModal.offer?.id;
        closeApplyModal();
        await handleApply(offerId, coverLetter);
    };

    const generateCoverLetter = async (offerId) => {
        setCoverLetterState(prev => ({ ...prev, isOpen: true, loading: true, content: '', editable: false }));

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://stag-io-b8nn.onrender.com/api/ai/cover-letter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ offerId })
            });

            if (!response.ok) throw new Error('Generation failed');

            setCoverLetterState(prev => ({ ...prev, loading: false }));

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

                for (const line of lines) {
                    const data = line.replace('data: ', '').trim();
                    if (data === '[DONE]') break;
                    try {
                        const { token: aiToken } = JSON.parse(data);
                        setCoverLetterState(prev => ({ ...prev, content: prev.content + aiToken }));
                    } catch (e) {
                        // Malformed JSON
                    }
                }
            }
        } catch (err) {
            console.error("GENERATE CV ERROR:", err);
            toast.error("Failed to generate cover letter.");
            setCoverLetterState(prev => ({ ...prev, loading: false, isOpen: false }));
        }
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(coverLetterState.content);
        toast.success("Copied to clipboard!");
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const lines = doc.splitTextToSize(coverLetterState.content, 180);
        doc.text(lines, 15, 20);
        doc.save(`Cover_Letter_${selectedOffer?.company || 'Company'}.pdf`);
        toast.success("PDF Downloaded successfully!");
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">

            {/* Filters Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5 overflow-y-auto space-y-6 shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                        <Filter className="w-5 h-5 mr-2 text-teal-400" /> Filters
                    </h2>
                    <button onClick={resetFilters} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline">Reset</button>
                </div>

                {/* Keyword */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Title, Company..."
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                            className="w-full bg-white dark:bg-[#111827] border border-gray-300 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none"
                        />
                    </div>
                </div>

                {/* Wilaya Option */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</label>
                    <select
                        value={wilaya}
                        onChange={e => setWilaya(e.target.value)}
                        className="w-full bg-white dark:bg-[#111827] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none appearance-none"
                    >
                        <option value="">All Wilayas</option>
                        {ALGERIAN_WILAYAS.map((w, i) => (
                            <option key={i} value={w}>{String(i + 1).padStart(2, '0')} - {w}</option>
                        ))}
                    </select>
                </div>

                {/* Type */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Internship Type</label>
                    <div className="space-y-2">
                        {['PFE', 'Summer', 'Part-time'].map(t => (
                            <label key={t} className="flex items-center text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white">
                                <input
                                    type="radio"
                                    name="type"
                                    checked={type === t}
                                    onChange={() => setType(t)}
                                    className="mr-2 text-teal-500 bg-[#111827] border-gray-600 focus:ring-teal-500 focus:ring-offset-[#111827]"
                                />
                                {t}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tech Skills</label>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_SKILLS.map(skill => (
                            <button
                                key={skill}
                                onClick={() => toggleSkill(skill)}
                                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${selectedSkills.includes(skill)
                                    ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                                    : 'border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20'
                                    }`}
                            >
                                {skill}
                            </button>
                        ))}
                    </div>
                </div>

            </div>

            {/* Results Area */}
            <div className="flex-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col relative shadow-sm dark:shadow-none">
                <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {loading ? 'Searching...' : `${offers.length} Results Found`}
                    </h2>
                    <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Sort By:</span>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="bg-white dark:bg-[#111827] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="match">🎯 Best Match</option>
                            <option value="newest">🆕 Newest First</option>
                            <option value="oldest">⏳ Oldest First</option>
                        </select>
                    </div>
                </div>


                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-white/5 animate-pulse rounded-xl"></div>)}
                        </div>
                    ) : offers.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {offers.map(offer => (
                                <div key={offer.id} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-xl p-5 hover:border-teal-500/30 transition-colors flex flex-col h-full group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-lg shrink-0">
                                                {offer.company.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white leading-tight group-hover:text-teal-400 transition-colors">{offer.title}</h3>
                                                <div className="flex items-center mt-1">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mr-3">{offer.company}</p>
                                                    {offer.matchScore > 0 && (
                                                        <span className="text-[10px] font-bold text-teal-400 uppercase tracking-tighter">
                                                            {offer.matchCount} matched skills
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {offer.matchScore > 0 && (
                                            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${offer.matchScore >= 70 ? 'bg-green-500/20 text-green-400' : offer.matchScore >= 40 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {offer.matchScore >= 70 ? 'Strong Match' : offer.matchScore >= 40 ? 'Good Match' : 'Partial Match'} ({offer.matchScore}%)
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-3 mb-4 text-xs font-medium">
                                        <span className="flex items-center text-gray-500 dark:text-gray-400 font-medium"><MapPin className="w-3.5 h-3.5 mr-1" /> {offer.wilaya}</span>
                                        <span className="flex items-center text-gray-500 dark:text-gray-400 font-medium"><Calendar className="w-3.5 h-3.5 mr-1" /> {offer.duration}</span>
                                        {offer.startDate && offer.endDate && formatDateSafe(offer.startDate) && formatDateSafe(offer.endDate) && (
                                            <span className="flex items-center text-amber-600 dark:text-amber-400 font-medium"><Calendar className="w-3.5 h-3.5 mr-1" /> {formatDateSafe(offer.startDate)} - {formatDateSafe(offer.endDate)}</span>
                                        )}
                                        <div className="flex items-center space-x-2">
                                            <span className="flex items-center text-gray-500 dark:text-gray-400 font-medium"><Briefcase className="w-3.5 h-3.5 mr-1" /> {offer.type}</span>
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${offer.workMode === 'on-site' ? 'border-blue-500/20 bg-blue-500/10 text-blue-400' : offer.workMode === 'remote' ? 'border-green-500/20 bg-green-500/10 text-green-400' : 'border-purple-500/20 bg-purple-500/10 text-purple-400'}`}>
                                                {offer.workMode === 'on-site' ? '🏢' : offer.workMode === 'remote' ? '🏠' : '🔀'} {offer.workMode}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                                        {offer.skills.map(s => {
                                            const isMatch = offer.studentSkills.map(sk => sk.toLowerCase()).includes(s.toLowerCase());
                                            return (
                                                <span
                                                    key={s}
                                                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider transition-colors ${isMatch
                                                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                                                        : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white'
                                                        }`}
                                                >
                                                    {s}
                                                </span>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setSelectedOffer(offer)}
                                        className="w-full flex justify-center items-center py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-colors mt-auto"
                                    >
                                        View Details <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                            <Search className="w-16 h-16 text-gray-600 opacity-50" />
                            <p className="text-lg">No offers found matching your criteria</p>
                            <button onClick={resetFilters} className="text-teal-400 hover:text-teal-300">Clear filters</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Slide-in Drawer */}
            {selectedOffer && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOffer(null)}></div>
                    <div className="relative w-full max-w-md bg-[#0F1C2E] border-l border-white/10 h-full shadow-2xl flex flex-col transform transition-transform duration-300 animate-slide-in-right">

                        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <h2 className="text-xl font-bold text-white">Offer Details</h2>
                            <button onClick={() => setSelectedOffer(null)} className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-3xl">
                                    {selectedOffer.company.charAt(0)}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white leading-tight">{selectedOffer.title}</h1>
                                    <p className="text-lg text-gray-400">{selectedOffer.company}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <span className="flex items-center px-3 py-1 bg-white/5 rounded-lg text-sm text-gray-300"><MapPin className="w-4 h-4 mr-2 text-teal-400" /> {selectedOffer.wilaya}</span>
                                <span className="flex items-center px-3 py-1 bg-white/5 rounded-lg text-sm text-gray-300"><Briefcase className="w-4 h-4 mr-2 text-blue-400" /> {selectedOffer.type}</span>
                                <span className="flex items-center px-3 py-1 bg-white/5 rounded-lg text-sm text-gray-300">
                                    <span className="mr-2">{selectedOffer.workMode === 'on-site' ? '🏢' : selectedOffer.workMode === 'remote' ? '🏠' : '🔀'}</span>
                                    {selectedOffer.workMode.charAt(0).toUpperCase() + selectedOffer.workMode.slice(1)}
                                </span>
                                <span className="flex items-center px-3 py-1 bg-white/5 rounded-lg text-sm text-gray-300"><Calendar className="w-4 h-4 mr-2 text-purple-400" /> {selectedOffer.duration}</span>
                                {selectedOffer.startDate && selectedOffer.endDate && formatDateSafe(selectedOffer.startDate) && formatDateSafe(selectedOffer.endDate) && (
                                    <span className="flex items-center px-3 py-1 bg-white/5 rounded-lg text-sm text-amber-300"><Calendar className="w-4 h-4 mr-2 text-amber-400" /> {formatDateSafe(selectedOffer.startDate)} - {formatDateSafe(selectedOffer.endDate)}</span>
                                )}
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Required Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedOffer.skills.map(s => (
                                        <span key={s} className="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white px-3 py-1 rounded-md text-sm">{s}</span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Description</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                                    {selectedOffer.desc}
                                    {'\n\n'}We are looking for motivated students who are eager to learn and contribute to real-world projects. You will be assigned a mentor and work closely with our core engineering team.
                                </p>
                            </div>
                        </div>

                        <div className="p-5 border-t border-white/10 bg-white/5 space-y-3">
                            {selectedOffer.applied ? (
                                <div className="w-full py-3 rounded-lg bg-white/5 border border-white/10 text-center text-gray-400 font-medium flex items-center justify-center cursor-not-allowed">
                                    <XCircle className="w-5 h-5 mr-2" /> Already Applied
                                </div>
                            ) : (
                                <button
                                    onClick={() => openApplyModal(selectedOffer)}
                                    className="w-full py-3 rounded-lg bg-teal-500 text-white font-bold hover:bg-teal-400 hover:scale-[1.02] transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                                >
                                    Apply Now
                                </button>
                            )}

                            <button
                                onClick={() => generateCoverLetter(selectedOffer.id)}
                                className="w-full py-3 rounded-lg border border-teal-500 text-teal-400 font-bold hover:bg-teal-500/10 hover:scale-[1.02] transition-all flex justify-center items-center"
                            >
                                <FileText className="w-5 h-5 mr-2" />
                                ✍️ Generate Cover Letter
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cover Letter Modal */}
            {coverLetterState.isOpen && (
                <div className="fixed inset-0 z-[70] flex justify-center items-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#0F1C2E] border border-white/10 w-full max-w-3xl rounded-xl p-6 shadow-2xl relative flex flex-col max-h-[90vh] animate-slide-in-right">
                        <button onClick={() => setCoverLetterState(p => ({ ...p, isOpen: false }))} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center space-x-3 mb-6 border-b border-white/10 pb-4">
                            <FileText className="w-6 h-6 text-teal-400" />
                            <h2 className="text-lg font-bold text-white">Your Cover Letter for {selectedOffer?.title} at {selectedOffer?.company}</h2>
                        </div>

                        {coverLetterState.loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-4 min-h-[300px]">
                                <Loader2 className="w-10 h-10 animate-spin text-teal-400" />
                                <p className="text-gray-400 animate-pulse">Generating your professional cover letter...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col flex-1 min-h-[300px] overflow-hidden">
                                <div className="flex-1 overflow-y-auto mb-6 bg-white dark:bg-[#111827] rounded-lg border border-gray-200 dark:border-white/10 p-5">
                                    {coverLetterState.editable ? (
                                        <textarea
                                            value={coverLetterState.content}
                                            onChange={(e) => setCoverLetterState(p => ({ ...p, content: e.target.value }))}
                                            className="w-full min-h-[400px] bg-transparent text-gray-600 dark:text-gray-300 focus:outline-none resize-none leading-relaxed"
                                        />
                                    ) : (
                                        <div className="whitespace-pre-wrap text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                            {coverLetterState.content}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10 shrink-0">
                                    <button onClick={handleCopyToClipboard} className="flex items-center px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:text-white hover:bg-white/10 transition-colors">
                                        <Copy className="w-4 h-4 mr-2" /> 📋 Copy
                                    </button>
                                    <button onClick={handleDownloadPDF} className="flex items-center px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:text-white hover:bg-white/10 transition-colors">
                                        <Download className="w-4 h-4 mr-2" /> 📄 Download PDF
                                    </button>
                                    <button onClick={() => setCoverLetterState(p => ({ ...p, editable: !p.editable }))} className="flex items-center px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:text-white hover:bg-white/10 transition-colors">
                                        <PenTool className="w-4 h-4 mr-2" /> ✏️ {coverLetterState.editable ? 'Read-only' : 'Make Editable'}
                                    </button>
                                    <button onClick={() => generateCoverLetter(selectedOffer.id)} className="flex items-center px-4 py-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 rounded-lg hover:bg-teal-500/20 ml-auto transition-colors">
                                        <RefreshCw className="w-4 h-4 mr-2" /> 🔄 Regenerate
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Apply with Cover Letter Modal */}
            {applyModal.open && (
                <div className="fixed inset-0 z-[80] flex justify-center items-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-[#0F1C2E] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden">

                        {/* Header */}
                        <div className="px-6 pt-6 pb-4 border-b border-white/10">
                            <h2 className="text-xl font-bold text-white">
                                Apply to <span className="text-teal-400">{applyModal.offer?.title}</span>
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">
                                at <span className="text-gray-300 font-medium">{applyModal.offer?.company}</span>
                            </p>
                            <p className="text-sm text-gray-400 mt-3">Write a cover letter to introduce yourself to the company.</p>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 space-y-3">
                            <div className="relative">
                                <textarea
                                    rows={10}
                                    maxLength={1000}
                                    value={coverLetter}
                                    onChange={e => { setCoverLetter(e.target.value); setCoverLetterWarning(false); }}
                                    placeholder="Introduce yourself, explain why you're interested in this position and how your skills match the requirements..."
                                    className="w-full bg-white dark:bg-[#111827] border border-gray-300 dark:border-white/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                />
                                <span className={`absolute bottom-3 right-4 text-xs font-mono ${coverLetter.length >= 1000 ? 'text-red-400' : 'text-gray-500'
                                    }`}>
                                    {coverLetter.length} / 1000
                                </span>
                            </div>

                            {coverLetterWarning && (
                                <p className="text-sm text-amber-400 flex items-center gap-1.5">
                                    ⚠️ Please write a cover letter before applying.
                                </p>
                            )}

                            {/* AI button */}
                            <button
                                onClick={() => handleAIGenerate(applyModal.offer?.id)}
                                disabled={aiGenerating}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-teal-500/50 text-teal-400 text-sm font-semibold hover:bg-teal-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {aiGenerating ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                                ) : (
                                    <>✍️ Write with AI</>
                                )}
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-6 flex items-center gap-3">
                            <button
                                onClick={closeApplyModal}
                                className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitApplication}
                                className="flex-1 py-2.5 rounded-lg bg-teal-500 text-white text-sm font-bold hover:bg-teal-400 transition-all shadow-[0_0_15px_rgba(20,184,166,0.25)] flex items-center justify-center gap-2"
                            >
                                Send Application →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Style for the drawer animation */}
            <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out forwards;
        }
      `}</style>
        </div>
    );
};

export default InternshipSearch;
