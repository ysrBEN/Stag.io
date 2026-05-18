import { useState, useEffect, useMemo } from 'react';
import { Search, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const PER_PAGE = 10;

const StudentsTable = () => {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await axiosInstance.get('/admin/students');
                const formatted = res.data.map(s => ({
                    id: s._id,
                    name: s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Unknown',
                    email: s.user?.email || 'N/A',
                    university: s.university || 'Not specified',
                    field: s.fieldOfStudy || 'Not specified',
                    year: s.academicYear || 'Not specified',
                    skills: s.skills || [],
                    placed: s.placed
                }));
                setStudents(formatted);
                setLoading(false);
            } catch (err) {
                console.error("STUDENTS FETCH ERROR:", err);
                toast.error('Failed to load students');
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return students.filter(s => {
            const matchSearch = !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
            const matchStatus = statusFilter === 'all' || (statusFilter === 'placed' ? s.placed : !s.placed);
            return matchSearch && matchStatus;
        });
    }, [students, search, statusFilter]);

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <div className="space-y-6 fade-in-up">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-teal-600 dark:text-teal-400" /> Registered Students
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{filtered.length} student(s) found</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none transition-all shadow-sm dark:shadow-none"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'placed', 'unplaced'].map(f => (
                        <button
                            key={f}
                            onClick={() => { setStatusFilter(f); setPage(1); }}
                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${statusFilter === f
                                ? 'bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/40 text-teal-600 dark:text-teal-400'
                                : 'bg-white dark:bg-transparent border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="h-72 bg-white/5 animate-pulse rounded-xl" />
            ) : (
                <>
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-x-auto shadow-sm dark:shadow-none">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                            <thead className="bg-gray-50 dark:bg-[#0F1C2E]">
                                <tr>
                                    {['Name', 'University', 'Field / Year', 'Skills', 'Status'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {paginated.length === 0 ? (
                                    <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-500 dark:text-gray-400">No students found</td></tr>
                                ) : paginated.map(s => (
                                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                    {s.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500">{s.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{s.university}</td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{s.field}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 font-bold">{s.year}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {s.skills.slice(0, 3).map(sk => (
                                                    <span key={sk} className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded text-[10px] font-medium border border-gray-200 dark:border-white/10">{sk}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            {s.placed ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20">✅ Placed</span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20">⏳ Searching</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">
                                Page {page} of {totalPages} — {filtered.length} results
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-lg bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentsTable;
