import { useState, useEffect, useMemo } from 'react';
import { Search, Building2, MapPin, Globe } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const ALGERIAN_WILAYAS = [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
    "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda",
    "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara",
    "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt",
    "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa",
    "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam",
    "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"
];

const CompaniesTable = () => {
    const [loading, setLoading] = useState(true);
    const [companies, setCompanies] = useState([]);
    const [search, setSearch] = useState('');
    const [filterWilaya, setFilterWilaya] = useState('');

    useEffect(() => {
        const fetchCompaniesData = async () => {
            try {
                const [compRes, appsRes] = await Promise.all([
                    axiosInstance.get('/admin/companies'),
                    axiosInstance.get('/admin/internships/pending')
                ]);

                const formatted = compRes.data.map(c => {
                    // Count accepted/validated students for this specific company
                    const acceptedCount = appsRes.data.filter(a =>
                        a.offer?.company?._id === c._id &&
                        (a.status === 'accepted' || a.status === 'validated')
                    ).length;

                    return {
                        id: c._id,
                        name: c.name || 'N/A',
                        wilaya: c.location || 'N/A',
                        website: c.website || '',
                        totalOffers: c.offerCount || 0,
                        accepted: acceptedCount
                    };
                });

                setCompanies(formatted);
                setLoading(false);
            } catch (err) {
                console.error("COMPANIES FETCH ERROR:", err);
                toast.error('Failed to load companies data');
                setLoading(false);
            }
        };
        fetchCompaniesData();
    }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return companies.filter(c => {
            const matchSearch = !q || c.name.toLowerCase().includes(q);
            const matchWilaya = !filterWilaya || c.wilaya === filterWilaya;
            return matchSearch && matchWilaya;
        });
    }, [companies, search, filterWilaya]);

    return (
        <div className="space-y-6 fade-in-up">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-teal-600 dark:text-teal-400" /> Registered Companies
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{filtered.length} company(ies) found</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                        placeholder="Search by company name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none transition-all shadow-sm dark:shadow-none"
                    />
                </div>
                <div className="relative sm:w-56">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <select
                        value={filterWilaya}
                        onChange={e => setFilterWilaya(e.target.value)}
                        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none appearance-none transition-all shadow-sm dark:shadow-none"
                    >
                        <option value="" className="bg-white dark:bg-[#1E3A5F] text-gray-900 dark:text-white">All Wilayas</option>
                        {ALGERIAN_WILAYAS.map((w, i) => (
                            <option key={i} value={w} className="bg-white dark:bg-[#1E3A5F] text-gray-900 dark:text-white">{String(i + 1).padStart(2, '0')} - {w}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="h-72 bg-white/5 animate-pulse rounded-xl" />
            ) : (
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-x-auto shadow-sm dark:shadow-none">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                        <thead className="bg-gray-50 dark:bg-[#0F1C2E]">
                            <tr>
                                {['Company', 'Wilaya', 'Website', 'Total Offers', 'Accepted Students'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-500 dark:text-gray-400">No companies found</td></tr>
                            ) : filtered.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg shrink-0 border border-teal-100 dark:border-teal-500/20">
                                                {c.name.charAt(0)}
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{c.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />{c.wilaya}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        {c.website ? (
                                            <a href={c.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 hover:underline font-medium">
                                                <Globe className="w-3.5 h-3.5" /> {c.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        ) : <span className="text-gray-400 dark:text-gray-600 text-sm">—</span>}
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                                            {c.totalOffers}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${c.accepted > 0 ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-500 border-gray-200 dark:border-white/10'}`}>
                                            {c.accepted}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CompaniesTable;
