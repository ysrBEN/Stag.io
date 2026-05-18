import { useState, useEffect } from 'react';
import { Building2, MapPin, Globe, Loader2, Briefcase, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import useAuth from '../../hooks/useAuth';
import { compressImage } from '../../utils/imageUtils';

const ALGERIAN_WILAYAS = [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar",
    "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger",
    "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
    "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh",
    "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued",
    "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa",
    "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah",
    "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"
];

const INDUSTRIES = [
    "Technology", "Oil & Gas", "Finance", "Healthcare", "Education",
    "Telecom", "Agriculture", "Construction", "Transport & Logistics",
    "Manufacturing", "Retail", "Media & Entertainment", "Other"
];

const CompanyProfile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        companyName: '',
        description: '',
        wilaya: '',
        website: '',
        industry: '',
        profilePicture: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosInstance.get('/company/profile');
                console.log("COMPANY PROFILE DATA RETURNED:", res.data); // 🔍 Debug log
                if (res.data) {
                    setFormData({
                        companyName: res.data.companyName || '',
                        description: res.data.description || '',
                        wilaya: res.data.wilaya || '',
                        website: res.data.websiteUrl || '',
                        industry: res.data.industry || '',
                        profilePicture: res.data.profilePicture || ''
                    });
                }
                setLoading(false);
            } catch (err) {
                console.error("COMPANY PROFILE FETCH ERROR:", err);
                toast.error('Failed to load company profile');
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                companyName: formData.companyName,
                description: formData.description,
                wilaya: formData.wilaya,
                industry: formData.industry,
                websiteUrl: formData.website,
                profilePicture: formData.profilePicture
            };
            await axiosInstance.put('/company/profile', payload);
            toast.success('Company profile updated successfully!');
        } catch (err) {
            console.error("PROFILE UPDATE ERROR:", err);
            toast.error(err?.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-1/3 h-80 bg-white/5 animate-pulse rounded-2xl"></div>
                <div className="w-full lg:w-2/3 h-96 bg-white/5 animate-pulse rounded-2xl"></div>
            </div>
        );
    }

    const initials = formData.companyName
        .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

    return (
        <div className="flex flex-col lg:flex-row gap-8 fade-in-up">

            {/* Left — Preview Card */}
            <div className="w-full lg:w-1/3">
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-8 text-center shadow-lg dark:shadow-none sticky top-6 space-y-4">
                    {/* Logo Avatar */}
                    <div className="relative inline-flex w-24 h-24 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 items-center justify-center text-white font-bold text-4xl shadow-[0_0_30px_rgba(20,184,166,0.3)] mb-4 overflow-hidden">
                        {formData.profilePicture ? (
                            <img src={formData.profilePicture} alt="Company Logo" className="w-full h-full object-cover" />
                        ) : (
                            initials
                        )}
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                            <span className="text-white text-xs font-medium">Upload</span>
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        try {
                                            const base64 = await compressImage(e.target.files[0]);
                                            setFormData(prev => ({ ...prev, profilePicture: base64 }));
                                        } catch (err) {
                                            toast.error('Failed to process image');
                                        }
                                    }
                                }} 
                            />
                        </label>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{formData.companyName}</h2>
                        <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20">
                            {formData.industry || 'Company'}
                        </span>
                    </div>

                    <div className="space-y-3 text-sm text-left">
                        {formData.wilaya && (
                            <div className="flex items-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-white/5">
                                <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 mr-3 shrink-0" />
                                <span>{formData.wilaya}</span>
                            </div>
                        )}
                        {formData.website && (
                            <a
                                href={formData.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-white/5 hover:border-teal-500/30 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group"
                            >
                                <Globe className="w-4 h-4 text-gray-400 dark:text-gray-400 mr-3 shrink-0 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                                <span className="truncate">{formData.website.replace(/^https?:\/\//, '')}</span>
                            </a>
                        )}
                    </div>

                    {formData.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-left bg-gray-50 dark:bg-white/5 p-4 rounded-xl border-l-4 border-teal-500/50 italic leading-relaxed">
                            "{formData.description}"
                        </p>
                    )}
                </div>
            </div>

            {/* Right — Edit Form */}
            <div className="w-full lg:w-2/3">
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl dark:shadow-none">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-white/10">
                        <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Company Profile</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company Name</label>
                            <input
                                type="text"
                                name="companyName"
                                required
                                value={formData.companyName}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-[#0F1C2E] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full bg-gray-50 dark:bg-[#0F1C2E] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none resize-y transition-all"
                                placeholder="Tell students about your company..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> Wilaya
                                </label>
                                <select
                                    name="wilaya"
                                    required
                                    value={formData.wilaya}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 dark:bg-[#0F1C2E] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none appearance-none transition-all"
                                >
                                    <option value="" disabled>Select Wilaya</option>
                                    {ALGERIAN_WILAYAS.map((w, i) => (
                                        <option key={i} value={w} className="bg-white dark:bg-[#1E3A5F] text-gray-900 dark:text-white">
                                            {String(i + 1).padStart(2, '0')} - {w}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" /> Industry / Sector
                                </label>
                                <select
                                    name="industry"
                                    value={formData.industry}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 dark:bg-[#0F1C2E] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none appearance-none transition-all"
                                >
                                    <option value="" disabled>Select Industry</option>
                                    {INDUSTRIES.map(ind => (
                                        <option key={ind} value={ind} className="bg-white dark:bg-[#1E3A5F] text-gray-900 dark:text-white">{ind}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Globe className="w-4 h-4" /> Website URL
                            </label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 dark:bg-[#0F1C2E] border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                    placeholder="https://yourcompany.dz"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center justify-center py-2.5 px-6 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-all duration-200 shadow-[0_0_15px_rgba(20,184,166,0.2)] min-w-[140px]"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>

        </div>
    );
};

export default CompanyProfile;
