import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    LineChart, Line
} from 'recharts';
import axiosInstance from '../../api/axiosInstance';
import { useTheme } from '../../context/ThemeContext';

const COLORS = ['#0D9488', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#EC4899', '#6366F1'];

const Statistics = () => {
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        summary: {},
        wilayaOffers: [],
        placementData: [],
        applicationsOverTime: [],
        topSkills: [],
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsRes, offersRes, appsRes] = await Promise.all([
                    axiosInstance.get('/admin/stats'),
                    axiosInstance.get('/offers'),
                    axiosInstance.get('/admin/internships/pending')
                ]);

                const totalStudents = statsRes.data.totalStudents || 0;
                const validatedApps = appsRes.data.filter(a => a.status === 'validated');
                const placementRate = totalStudents > 0 ? ((validatedApps.length / totalStudents) * 100).toFixed(1) : 0;

                // 1. Summary
                const summary = {
                    students: totalStudents,
                    companies: statsRes.data.totalCompanies || 0,
                    offers: offersRes.data.length || 0,
                    placementRate
                };

                // 2. Wilaya Offers
                const wCount = {};
                offersRes.data.forEach(o => {
                    wCount[o.location] = (wCount[o.location] || 0) + 1;
                });
                const wilayaOffers = Object.entries(wCount)
                    .map(([wilaya, count]) => ({ wilaya, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 8);

                // 3. Placement Data
                const placementData = [
                    { name: 'Placed', value: validatedApps.length },
                    { name: 'Searching', value: Math.max(0, totalStudents - validatedApps.length) }
                ];

                // 4. Applications over time (last 8 months)
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const appsByMonth = {};
                appsRes.data.forEach(a => {
                    const date = new Date(a.createdAt);
                    const key = `${monthNames[date.getMonth()]}`;
                    appsByMonth[key] = (appsByMonth[key] || 0) + 1;
                });
                const applicationsOverTime = monthNames.map(m => ({ month: m, apps: appsByMonth[m] || 0 })).slice(-8);

                // 5. Top Skills
                const sCount = {};
                offersRes.data.forEach(o => {
                    (o.technologies || []).forEach(s => {
                        sCount[s] = (sCount[s] || 0) + 1;
                    });
                });
                const topSkills = Object.entries(sCount)
                    .map(([skill, count]) => ({ skill, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 8);

                setData({
                    summary,
                    wilayaOffers,
                    placementData,
                    applicationsOverTime,
                    topSkills
                });
                setLoading(false);
            } catch (err) {
                console.error("STATS ERROR:", err);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const chartStyle = {
        backgroundColor: isDark ? '#0F1C2E' : '#FFFFFF',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: 8,
        color: isDark ? '#e5e7eb' : '#111827'
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white/5 animate-pulse rounded-xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-72 bg-white/5 animate-pulse rounded-xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 fade-in-up">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Statistics</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Comprehensive analytics overview of Stag.io</p>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Students', value: data.summary.students, color: 'text-blue-600 dark:text-blue-400' },
                    { label: 'Total Companies', value: data.summary.companies, color: 'text-purple-600 dark:text-purple-400' },
                    { label: 'Total Offers', value: data.summary.offers, color: 'text-teal-600 dark:text-teal-400' },
                    { label: 'Placement Rate', value: `${data.summary.placementRate}%`, color: 'text-green-600 dark:text-green-400' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 text-center hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm dark:shadow-none">
                        <p className={`text-3xl font-bold ${color}`}>{value}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-3 shadow-sm dark:shadow-none">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Top 8 Wilayas by Offers Posted</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.wilayaOffers} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                                <XAxis dataKey="wilaya" tick={{ fill: isDark ? '#9ca3af' : '#4b5563', fontSize: 10 }} />
                                <YAxis tick={{ fill: isDark ? '#9ca3af' : '#4b5563', fontSize: 10 }} />
                                <Tooltip contentStyle={chartStyle} />
                                <Bar dataKey="count" fill="#0D9488" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-3 shadow-sm dark:shadow-none">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Students Placed vs Still Searching</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data.placementData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                                    {data.placementData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                </Pie>
                                <Tooltip contentStyle={chartStyle} />
                                <Legend wrapperStyle={{ fontSize: 12, color: isDark ? '#9ca3af' : '#4b5563' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-3 shadow-sm dark:shadow-none">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Applications Over Time (Monthly)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.applicationsOverTime} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                                <XAxis dataKey="month" tick={{ fill: isDark ? '#9ca3af' : '#4b5563', fontSize: 11 }} />
                                <YAxis tick={{ fill: isDark ? '#9ca3af' : '#4b5563', fontSize: 11 }} />
                                <Tooltip contentStyle={chartStyle} />
                                <Line type="monotone" dataKey="apps" stroke="#0D9488" strokeWidth={2.5} dot={{ fill: '#0D9488', r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-3 shadow-sm dark:shadow-none">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Top 8 Most Requested Skills</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.topSkills} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} horizontal={false} />
                                <XAxis type="number" tick={{ fill: isDark ? '#9ca3af' : '#4b5563', fontSize: 10 }} />
                                <YAxis dataKey="skill" type="category" tick={{ fill: isDark ? '#9ca3af' : '#4b5563', fontSize: 11 }} width={60} />
                                <Tooltip contentStyle={chartStyle} />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                    {data.topSkills.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Statistics;
