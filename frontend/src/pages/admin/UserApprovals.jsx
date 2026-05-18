import { useState, useEffect } from 'react';
import { UserCheck, UserX, Clock, GraduationCap, Building2, Search, ChevronLeft, ChevronRight, RefreshCw, ChevronDown, ChevronUp, AlertCircle, Mail, MapPin, Globe, Calendar as CalendarIcon, Info } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const TABS = ['pending', 'approved', 'rejected'];

const statusConfig = {
    pending: { label: 'Pending', color: 'yellow', icon: <Clock className="w-3.5 h-3.5" /> },
    approved: { label: 'Approved', color: 'teal', icon: <UserCheck className="w-3.5 h-3.5" /> },
    rejected: { label: 'Rejected', color: 'red', icon: <UserX className="w-3.5 h-3.5" /> },
};

const PER_PAGE = 8;

const UserApprovals = () => {
    const [tab, setTab] = useState('pending');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pendingCount, setPendingCount] = useState(0);
    const [expandedUser, setExpandedUser] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null); // { userId, action, name, role }

    const fetchUsers = async (status) => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get(`/admin/users?status=${status}`);
            setUsers(data);
            if (status === 'pending') setPendingCount(data.length);
        } catch {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    // Keep pending count updated regardless of current tab
    const refreshPendingCount = async () => {
        try {
            const { data } = await axiosInstance.get('/admin/users?status=pending');
            setPendingCount(data.length);
        } catch { /* silent */ }
    };

    useEffect(() => {
        setPage(1);
        setSearch('');
        fetchUsers(tab);
    }, [tab]);

    const handleAction = async (userId, action) => {
        setActionLoading(userId + action);
        try {
            await axiosInstance.put(`/admin/users/${userId}/${action}`);
            toast.success(`User ${action}d successfully`);
            setConfirmAction(null);
            await fetchUsers(tab);
            if (tab !== 'pending') await refreshPendingCount();
        } catch {
            toast.error(`Failed to ${action} user`);
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = users.filter(u => {
        const q = search.toLowerCase();
        return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    });

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <div className="space-y-6 fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <UserCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" /> User Approvals
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Manage account access for students and companies</p>
                </div>
                <button
                    onClick={() => fetchUsers(tab)}
                    className="p-2 rounded-lg bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/30 transition-colors shadow-sm dark:shadow-none"
                    title="Refresh"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Tab bar */}
            <div className="flex gap-2">
                {TABS.map(t => {
                    const cfg = statusConfig[t];
                    const isActive = tab === t;
                    return (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all
                                ${isActive
                                    ? `bg-${cfg.color}-50 dark:bg-${cfg.color}-500/10 border-${cfg.color}-200 dark:border-${cfg.color}-500/40 text-${cfg.color}-600 dark:text-${cfg.color}-400 shadow-sm dark:shadow-none`
                                    : 'bg-white dark:bg-transparent border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            {cfg.icon}
                            {cfg.label}
                            {t === 'pending' && pendingCount > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full border border-red-200 dark:border-red-500/30">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none transition-all shadow-sm dark:shadow-none"
                />
            </div>

            {/* Confirm Dialog Overlay */}
            {confirmAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#0F1C2E] border border-gray-200 dark:border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl scale-in-center">
                        <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4 ${confirmAction.action === 'approve' ? 'bg-teal-50 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400' : 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400'}`}>
                            {confirmAction.action === 'approve' ? <UserCheck className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                            {confirmAction.action === 'approve' ? 'Approve Account' : 'Reject Account'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-center text-sm mb-6">
                            {confirmAction.action === 'approve'
                                ? `Approve ${confirmAction.name}'s account as ${confirmAction.role}?`
                                : `Reject ${confirmAction.name}'s account? This cannot be undone.`}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAction(confirmAction.userId, confirmAction.action)}
                                disabled={!!actionLoading}
                                className={`flex-1 py-2 rounded-lg font-bold text-white transition-all ${confirmAction.action === 'approve' ? 'bg-teal-600 hover:bg-teal-500' : 'bg-red-600 hover:bg-red-500'}`}
                            >
                                {actionLoading ? 'Processing...' : confirmAction.action === 'approve' ? 'Approve' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List View */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-white/5 animate-pulse rounded-xl" />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {paginated.length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none">
                                <Info className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">No {tab} accounts found</p>
                            </div>
                        ) : paginated.map(u => {
                            const cfg = statusConfig[u.status] || statusConfig.pending;
                            const isStudent = u.role === 'student';
                            const isExpanded = expandedUser === u._id;

                            return (
                                <div key={u._id} className={`group bg-white dark:bg-white/5 border transition-all rounded-xl overflow-hidden shadow-sm dark:shadow-none
                                    ${isExpanded ? 'border-teal-500/40 ring-1 ring-teal-500/20 shadow-md dark:shadow-none' : 'border-gray-200 dark:border-white/10 hover:border-teal-200 dark:hover:border-white/20'}`}>

                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 shadow-lg
                                                    ${isStudent ? 'bg-gradient-to-br from-teal-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-pink-600'} text-white`}>
                                                    {(u.name || u.email).charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{u.name || 'Unknown User'}</h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1.5">
                                                        <Mail className="w-3 h-3" /> {u.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                bg-${cfg.color}-50 dark:bg-${cfg.color}-500/10 text-${cfg.color}-600 dark:text-${cfg.color}-400 border border-${cfg.color}-200 dark:border-${cfg.color}-500/20`}>
                                                {cfg.icon} {cfg.label}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-4">
                                            <div className="flex items-center gap-4">
                                                <span className={`flex items-center gap-1.5 text-xs font-bold ${isStudent ? 'text-teal-600 dark:text-teal-400' : 'text-purple-600 dark:text-purple-400'}`}>
                                                    {isStudent ? <GraduationCap className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                                                    {u.role.toUpperCase()}
                                                </span>
                                                <span className="text-[10px] text-gray-500 dark:text-gray-500 flex items-center gap-1">
                                                    <CalendarIcon className="w-3 h-3" />
                                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB') : '—'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setExpandedUser(isExpanded ? null : u._id)}
                                                className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 flex items-center gap-1 uppercase tracking-widest bg-teal-50 dark:bg-teal-500/5 px-2 py-1 rounded transition-colors border border-teal-100 dark:border-transparent"
                                            >
                                                {isExpanded ? 'Hide Details' : 'View Details'}
                                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                            </button>
                                        </div>

                                        {/* Expandable Details Area */}
                                        {isExpanded && (
                                            <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                                {isStudent ? (
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mb-0.5">University</p>
                                                            <p className="text-gray-900 dark:text-white break-words">{u.university || 'Not specified'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mb-0.5">Field of Study</p>
                                                            <p className="text-gray-900 dark:text-white break-words">{u.fieldOfStudy || 'Not specified'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mb-0.5">Academic Year</p>
                                                            <p className="text-gray-900 dark:text-white">{u.academicYear || 'Not specified'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mb-0.5">Wilaya</p>
                                                            <p className="text-gray-900 dark:text-white flex items-center gap-1">
                                                                <MapPin className="w-3 h-3 text-gray-400" /> {u.wilaya || 'Not specified'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mb-0.5">Company Name</p>
                                                            <p className="text-gray-900 dark:text-white break-words">{u.companyName || u.name || 'Not specified'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mb-0.5">Industry</p>
                                                            <p className="text-gray-900 dark:text-white break-words">{u.industry || 'Not specified'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mb-0.5">Website</p>
                                                            <p className="text-teal-600 dark:text-teal-400 break-all flex items-center gap-1 font-medium hover:underline">
                                                                <Globe className="w-3 h-3" /> {u.websiteUrl || 'Not specified'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mb-0.5">Wilaya</p>
                                                            <p className="text-gray-900 dark:text-white flex items-center gap-1">
                                                                <MapPin className="w-3 h-3 text-gray-400" /> {u.wilaya || 'Not specified'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Row actions */}
                                        <div className="mt-5 flex gap-2">
                                            {u.status !== 'approved' && (
                                                <button
                                                    onClick={() => setConfirmAction({ userId: u._id, action: 'approve', name: u.name || u.email, role: u.role })}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/30
                                                        bg-teal-50 dark:bg-teal-500/10 hover:bg-teal-100 dark:hover:bg-teal-500/20 rounded-lg transition-all"
                                                >
                                                    <UserCheck className="w-4 h-4" /> Approve
                                                </button>
                                            )}
                                            {u.status !== 'rejected' && (
                                                <button
                                                    onClick={() => setConfirmAction({ userId: u._id, action: 'reject', name: u.name || u.email, role: u.role })}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30
                                                        bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-all"
                                                >
                                                    <UserX className="w-4 h-4" /> Reject
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Page {page} of {totalPages} — {filtered.length} results</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm dark:shadow-none"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-lg bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm dark:shadow-none"
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

export default UserApprovals;
