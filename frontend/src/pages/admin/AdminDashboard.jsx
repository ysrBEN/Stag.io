import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Building2, CheckCircle, Clock, ArrowRight, CheckSquare, Download } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import axiosInstance from '../../api/axiosInstance';
import { generateConvention } from '../../utils/generateConvention';
import { useTheme } from '../../context/ThemeContext';

const COLORS = ['#0D9488', '#3B82F6', '#EF4444', '#F59E0B'];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ students: 0, companies: 0, validated: 0, pending: 0 });
    const [pendingList, setPendingList] = useState([]);
    const [validatedList, setValidatedList] = useState([]);
    const [wilayaData, setWilayaData] = useState([]);
    const [statusData, setStatusData] = useState([]);

    const handleDownloadConvention = async (appId) => {
        try {
            const res = await axiosInstance.get(`/applications/${appId}/convention`);
            generateConvention(res.data);
        } catch (err) {
            console.error("PDF ERROR:", err);
            // using simple alert for admin quick action if toast not imported
            alert('Failed to generate PDF');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, pendingRes, validatedRes, allAppsRes] = await Promise.all([
                    axiosInstance.get('/admin/stats'),
                    axiosInstance.get('/admin/internships/pending?status=accepted&limit=5'),
                    axiosInstance.get('/admin/internships/pending?status=validated&limit=5'),
                    axiosInstance.get('/admin/internships/pending')
                ]);

                setStats({
                    students: statsRes.data.students || 0,
                    companies: statsRes.data.companies || 0,
                    validated: statsRes.data.validatedApps || 0,
                    pending: statsRes.data.pendingApps || 0
                });

                const mapApp = (a) => ({
                    id: a._id,
                    student: a.student?.user?.name || 'Unknown',
                    company: a.offer?.company?.user?.companyName || a.offer?.company?.user?.name || 'Unknown',
                    offerTitle: a.offer?.title || 'Unknown',
                    date: a.status === 'validated' ? a.validatedAt : a.acceptedAt,
                    status: a.status
                });

                setPendingList(pendingRes.data.map(mapApp));
                setValidatedList(validatedRes.data.map(mapApp));

                const formattedWilaya = (statsRes.data.studentsByWilaya || [])
                    .map(item => ({
                        wilaya: item.wilaya,
                        count: item.count
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 6);

                setWilayaData(formattedWilaya.length > 0 ? formattedWilaya : [{ wilaya: 'N/A', count: 0 }]);

                const sCount = { Pending: 0, Accepted: 0, Refused: 0, Validated: 0 };
                allAppsRes.data.forEach(a => {
                    if (a.status === 'pending') sCount.Pending++;
                    else if (a.status === 'accepted') sCount.Accepted++;
                    else if (a.status === 'rejected' || a.status === 'refused') sCount.Refused++;
                    else if (a.status === 'validated') sCount.Validated++;
                });

                setStatusData(Object.entries(sCount).map(([name, value]) => ({ name, value })));

            } catch (err) {
                console.error("ADMIN DASHBOARD ERROR:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-72 bg-white/5 animate-pulse rounded-xl" />
                    <div className="h-72 bg-white/5 animate-pulse rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 fade-in-up">
            {/* Welcome banner */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-[#0F1C2E] dark:to-[#162035] border border-gray-200 dark:border-white/10 rounded-2xl p-8 relative overflow-hidden transition-all duration-300 shadow-sm dark:shadow-none">
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl opacity-50" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">Admin Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Overview of students, companies, and internship validations.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Students', value: stats.students, icon: <GraduationCap className="w-6 h-6" />, color: 'blue' },
                    { label: 'Total Companies', value: stats.companies, icon: <Building2 className="w-6 h-6" />, color: 'purple' },
                    { label: 'Validated', value: stats.validated, icon: <CheckCircle className="w-6 h-6" />, color: 'teal' },
                    { label: 'Pending', value: stats.pending, icon: <Clock className="w-6 h-6" />, color: 'red', badge: stats.pending > 0 },
                ].map(({ label, value, icon, color, badge }) => (
                    <div key={label} className={`bg-white dark:bg-white/5 border border-gray-200 dark:border-${color}-500/20 rounded-xl p-6 hover:border-${color}-500/40 hover:bg-gray-50 dark:hover:bg-white/10 transition-all group shadow-sm dark:shadow-none`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                                <h3 className={`text-3xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-${color}-600 dark:group-hover:text-${color}-400 transition-colors`}>{value}</h3>
                            </div>
                            <div className={`p-3 bg-${color}-500/10 rounded-lg text-${color}-600 dark:text-${color}-400 group-hover:scale-110 transition-transform relative`}>
                                {icon}
                                {badge && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-[#111827]" />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Pending validations list */}
                <div className="xl:col-span-2 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                            <CheckSquare className="w-5 h-5 mr-2 text-teal-600 dark:text-teal-400" /> Pending Validations
                            <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full border border-red-200 dark:border-red-500/30">{stats.pending}</span>
                        </h2>
                        <button onClick={() => navigate('/admin/validations')} className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 flex items-center">
                            View All <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-x-auto shadow-sm dark:shadow-none">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                            <thead className="bg-gray-50 dark:bg-[#0F1C2E]">
                                <tr>
                                    {['Student', 'Company', 'Offer', 'Date', ''].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {pendingList.length > 0 ? pendingList.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.student}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{item.company}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{item.offerTitle}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-500 whitespace-nowrap">
                                            {item.date ? new Date(item.date).toLocaleDateString('fr-DZ') : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => navigate('/admin/validations')}
                                                className="px-3 py-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-500/10 hover:bg-teal-100 dark:hover:bg-teal-500/20 rounded-lg transition-colors"
                                            >
                                                Validate
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500 text-sm italic">
                                            No pending validations at the moment.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Recently Validated List */}
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-4 pt-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2 text-teal-600 dark:text-teal-400" /> Recently Validated
                        </h2>
                        <button onClick={() => navigate('/admin/validations')} className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 flex items-center">
                            View All <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-x-auto shadow-sm dark:shadow-none">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                            <thead className="bg-gray-50 dark:bg-[#0F1C2E]">
                                <tr>
                                    {['Student', 'Company', 'Offer', 'Validated', ''].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {validatedList.length > 0 ? validatedList.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.student}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{item.company}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{item.offerTitle}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-500 whitespace-nowrap">
                                            {item.date ? new Date(item.date).toLocaleDateString('fr-DZ') : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleDownloadConvention(item.id)}
                                                className="px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors flex items-center inline-flex shadow-sm"
                                            >
                                                <Download className="w-3.5 h-3.5 mr-1" /> PDF
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500 text-sm italic">
                                            No validated internships yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Donut chart */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-4">Application Status</h2>
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 h-72 shadow-sm dark:shadow-none">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip
                                    formatter={(v, n) => [v, n]}
                                    contentStyle={{
                                        backgroundColor: isDark ? '#0F1C2E' : '#FFFFFF',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                        borderRadius: 8,
                                        color: isDark ? '#FFFFFF' : '#111827'
                                    }}
                                    itemStyle={{ color: isDark ? '#e5e7eb' : '#374151' }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12, color: isDark ? '#9ca3af' : '#4b5563' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Bar chart */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-4">Students Placed per Wilaya</h2>
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 h-72 shadow-sm dark:shadow-none">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={wilayaData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                            <XAxis dataKey="wilaya" tick={{ fill: isDark ? '#9ca3af' : '#4b5563', fontSize: 11 }} />
                            <YAxis tick={{ fill: isDark ? '#9ca3af' : '#4b5563', fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: isDark ? '#0F1C2E' : '#FFFFFF',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                    borderRadius: 8,
                                    color: isDark ? '#FFFFFF' : '#111827'
                                }}
                            />
                            <Bar dataKey="count" fill="#0D9488" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
}
export default AdminDashboard;