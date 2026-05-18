import { useState, useEffect } from 'react';
import { CheckCircle, Search, MapPin, Loader2, PartyPopper, Download, AlertTriangle, X as XIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import { generateConvention } from '../../utils/generateConvention';

import { ALGERIAN_WILAYAS } from '../../constants/wilayas';

const Validations = () => {
    const [loading, setLoading] = useState(true);
    const [pending, setPending] = useState([]);
    const [validated, setValidated] = useState(new Set());
    const [confirmId, setConfirmId] = useState(null);
    const [confirmRefuseId, setConfirmRefuseId] = useState(null);
    const [validating, setValidating] = useState(null);
    const [refusing, setRefusing] = useState(null);
    const [search, setSearch] = useState('');
    const [filterWilaya, setFilterWilaya] = useState('');

    useEffect(() => {
        const fetchPendingValidations = async () => {
            try {
                const res = await axiosInstance.get('/admin/internships/pending');
                const formatted = res.data.map(a => ({
                    id: a._id,
                    student: {
                        name: a.student?.user?.name || `${a.student?.firstName || ''} ${a.student?.lastName || ''}`.trim() || 'Student',
                        university: a.student?.user?.university || a.student?.university || 'University',
                        field: a.student?.user?.fieldOfStudy || a.student?.fieldOfStudy || 'Field',
                        year: a.student?.user?.academicYear || a.student?.academicYear || 'Year'
                    },
                    company: {
                        name: a.offer?.company?.name || 'Company',
                        wilaya: a.offer?.company?.location || 'Wilaya',
                        website: a.offer?.company?.website || ''
                    },
                    offer: {
                        title: a.offer?.title || 'Internship',
                        type: a.offer?.type || 'PFE',
                        duration: a.offer?.duration || 'Unknown',
                        skills: a.offer?.technologies || []
                    },
                    acceptedDate: a.updatedAt,
                    status: a.status
                }));
                // Set pending as those that are NOT YET validated
                setPending(formatted);
                setLoading(false);
            } catch (err) {
                console.error("VALIDATIONS FETCH ERROR:", err);
                toast.error('Failed to load pending validations');
                setLoading(false);
            }
        };
        fetchPendingValidations();
    }, []);

    const handleValidate = async (item) => {
        setValidating(item.id);
        try {
            await axiosInstance.put(`/admin/internships/${item.id}/validate`);
            setValidated(prev => new Set([...prev, item.id]));
            setConfirmId(null);

            // Update the item status in local list too
            setPending(prev => prev.map(p => p.id === item.id ? { ...p, status: 'validated' } : p));

            toast.success(`Internship for ${item.student.name} validated!`);
        } catch (err) {
            console.error("VALIDATE ERROR:", err);
            toast.error('Validation failed');
        } finally {
            setValidating(null);
        }
    };

    const handleRefuse = async (item) => {
        setRefusing(item.id);
        try {
            await axiosInstance.put(`/admin/internships/${item.id}/refuse`);
            setPending(prev => prev.filter(p => p.id !== item.id));
            setConfirmRefuseId(null);
            toast.error(`Internship for ${item.student.name} refused ❌`);
        } catch (err) {
            console.error("REFUSE ERROR:", err);
            toast.error('Refusal failed');
        } finally {
            setRefusing(null);
        }
    };

    const handleDownloadPDF = async (item) => {
        try {
            const res = await axiosInstance.get(`/applications/${item.id}/convention`);
            generateConvention(res.data);
            toast.success('Convention generated!');
        } catch (err) {
            console.error("PDF ERROR:", err);
            toast.error('Failed to generate PDF');
        }
    };

    const filtered = pending.filter(item => {
        const q = search.toLowerCase();
        const matchSearch = !q || item.student.name.toLowerCase().includes(q) || item.company.name.toLowerCase().includes(q);
        const matchWilaya = !filterWilaya || item.company.wilaya === filterWilaya;
        return matchSearch && matchWilaya;
    });

    const unvalidated = filtered.filter(i => i.status !== 'validated' && !validated.has(i.id));
    const validatedItems = filtered.filter(i => i.status === 'validated' || validated.has(i.id));

    const ValidatedBanner = ({ item }) => (
        <div className="mt-6 p-4 rounded-lg bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm">
                <p className="font-semibold text-teal-600 dark:text-teal-400 flex items-center">🎉 Internship validated successfully!</p>
                <p className="text-teal-600/70 dark:text-teal-300/80 mt-1 text-xs">The official convention de stage is ready for download.</p>
            </div>
            <button
                onClick={() => handleDownloadPDF(item)}
                className="flex items-center px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold rounded-lg transition-all border border-teal-500 shrink-0 shadow-md dark:shadow-[0_0_10px_rgba(20,184,166,0.3)] hover:scale-[1.02]"
            >
                <Download className="w-4 h-4 mr-2" /> Download Convention
            </button>
        </div>
    );

    return (
        <div className="space-y-6 fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Pending Validations
                        <span className="px-2.5 py-0.5 text-xs font-bold bg-red-500/20 text-red-600 dark:text-red-400 rounded-full border border-red-500/30">
                            {unvalidated.length}
                        </span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Review and officially validate accepted internships</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                        placeholder="Search student or company..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none transition-all shadow-sm dark:shadow-none"
                    />
                </div>
                <div className="relative sm:w-56">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <select
                        value={filterWilaya}
                        onChange={e => setFilterWilaya(e.target.value)}
                        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none appearance-none transition-all shadow-sm dark:shadow-none"
                    >
                        <option value="" className="text-gray-900 dark:text-white bg-white dark:bg-[#0F1C2E]">All Wilayas</option>
                        {ALGERIAN_WILAYAS.map((w, i) => (
                            <option key={i} value={w} className="text-gray-900 dark:text-white bg-white dark:bg-[#1E3A5F]">{String(i + 1).padStart(2, '0')} - {w}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-56 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 animate-pulse rounded-xl" />)}
                </div>
            ) : unvalidated.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none">
                    <PartyPopper className="w-16 h-16 mx-auto text-teal-600 dark:text-teal-400 mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🎉 All internships are validated!</h3>
                    <p className="text-gray-600 dark:text-gray-400">Great work — no pending validations at this time.</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {unvalidated.map(item => (
                        <div key={item.id} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 hover:border-teal-500/30 transition-all relative overflow-hidden shadow-sm dark:shadow-none">

                            {/* Confirm overlay */}
                            {confirmId === item.id && (
                                <div className="absolute inset-0 z-10 bg-white/95 dark:bg-[#0F1C2E]/95 rounded-xl flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm border border-teal-500/30">
                                    <AlertTriangle className="w-12 h-12 text-teal-600 dark:text-teal-400 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Confirm Validation</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        Are you sure you want to officially validate <span className="text-gray-900 dark:text-white font-medium">{item.student.name}</span>'s internship at <span className="text-gray-900 dark:text-white font-medium">{item.company.name}</span>?
                                        <br />A convention will be generated automatically.
                                    </p>
                                    <div className="flex gap-4 w-full max-w-xs">
                                        <button onClick={() => setConfirmId(null)} className="flex-1 py-2.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white font-bold transition-colors">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleValidate(item)}
                                            disabled={validating === item.id}
                                            className="flex-1 flex items-center justify-center py-2.5 rounded-lg bg-teal-600 dark:bg-teal-500 hover:bg-teal-500 dark:hover:bg-teal-400 text-white font-bold transition-colors"
                                        >
                                            {validating === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : '✅ Confirm'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Confirm Refuse overlay */}
                            {confirmRefuseId === item.id && (
                                <div className="absolute inset-0 z-10 bg-red-50/95 dark:bg-red-950/95 rounded-xl flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm border border-red-500/30">
                                    <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Confirm Refusal</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        Are you sure you want to <span className="text-red-600 dark:text-red-400 font-bold uppercase underline">refuse</span> the validation for <span className="text-gray-900 dark:text-white font-medium">{item.student.name}</span>?
                                        <br />This will notify the student and company.
                                    </p>
                                    <div className="flex gap-4 w-full max-w-xs">
                                        <button onClick={() => setConfirmRefuseId(null)} className="flex-1 py-2.5 rounded-lg bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-gray-700 dark:text-white font-bold transition-colors border border-gray-200 dark:border-transparent shadow-sm dark:shadow-none">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleRefuse(item)}
                                            disabled={refusing === item.id}
                                            className="flex-1 flex items-center justify-center py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                                        >
                                            {refusing === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : '❌ Refuse'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Student block */}
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">🎓 Student</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                                            {item.student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{item.student.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.student.university}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{item.student.field} · <span className="font-bold text-gray-900 dark:text-white">{item.student.year}</span></p>
                                </div>

                                {/* Company block */}
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">🏢 Company</p>
                                    <p className="font-bold text-gray-900 dark:text-white text-lg">{item.company.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" /> {item.company.wilaya}
                                    </p>
                                    {item.company.website && (
                                        <a href={item.company.website} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium">{item.company.website}</a>
                                    )}
                                </div>

                                {/* Offer block */}
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">📋 Offer</p>
                                    <p className="font-bold text-gray-900 dark:text-white">{item.offer.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.offer.type} · {item.offer.duration}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {item.offer.skills.map(s => (
                                            <span key={s} className="px-2 py-0.5 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-300 rounded text-[10px] font-bold border border-teal-100 dark:border-teal-500/20">{s}</span>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-medium">Accepted: {item.acceptedDate ? new Date(item.acceptedDate).toLocaleDateString('en-GB') : 'N/A'}</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row gap-3 justify-end">
                                {validated.has(item.id) || item.status === 'validated' ? (
                                    <ValidatedBanner item={item} />
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setConfirmRefuseId(item.id)}
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-transparent border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold rounded-lg transition-all shadow-sm dark:shadow-none"
                                        >
                                            <XIcon className="w-4 h-4" /> Refuse
                                        </button>
                                        <button
                                            onClick={() => setConfirmId(item.id)}
                                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 dark:bg-teal-500 hover:bg-teal-500 dark:hover:bg-teal-400 text-white font-bold rounded-lg transition-all shadow-md dark:shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:scale-[1.02]"
                                        >
                                            <CheckCircle className="w-5 h-5" /> Validate Internship
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Validations;
