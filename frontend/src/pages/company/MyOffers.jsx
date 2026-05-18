import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Users, Calendar, Briefcase, X, Loader2, Code, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';

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

const MyOffers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [offerSaving, setOfferSaving] = useState(false);

    // Delete confirm state
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        id: null,
        title: '',
        description: '',
        type: 'PFE',
        workMode: 'on-site',
        wilaya: '',
        wilaya: '',
        duration: '',
        skills: [],
        startDate: '',
        endDate: ''
    });
    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        setLoading(true);
        try {
            const [offersRes, appsRes] = await Promise.all([
                axiosInstance.get('/company/offers'),
                axiosInstance.get('/applications')
            ]);

            const dbApps = appsRes.data;
            const formatted = offersRes.data.map(o => ({
                id: o._id,
                title: o.title,
                description: o.description,
                type: o.type,
                workMode: o.workMode || 'on-site',
                wilaya: o.location,
                duration: o.duration,
                startDate: o.startDate ? o.startDate.split('T')[0] : '',
                endDate: o.endDate ? o.endDate.split('T')[0] : '',
                skills: o.technologies || [],
                applicantsCount: dbApps.filter(a => a.offer?._id === o._id).length
            }));
            setOffers(formatted);
            setLoading(false);
        } catch (e) {
            console.error("OFFERS FETCH ERROR:", e);
            toast.error('Failed to load offers');
            setLoading(false);
        }
    };

    const openModal = (mode, offer = null) => {
        setModalMode(mode);
        if (offer) {
            setFormData({
                id: offer.id,
                title: offer.title,
                description: offer.description,
                type: offer.type,
                workMode: offer.workMode,
                wilaya: offer.wilaya,
                duration: offer.duration,
                startDate: offer.startDate,
                endDate: offer.endDate,
                skills: [...offer.skills] // clone array
            });
        } else {
            setFormData({
                id: null,
                title: '',
                description: '',
                type: 'PFE',
                workMode: 'on-site',
                wilaya: '',
                duration: '',
                startDate: '',
                endDate: '',
                skills: []
            });
        }
        setSkillInput('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSkill = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newSkill = skillInput.trim();
            if (newSkill && !formData.skills.includes(newSkill)) {
                setFormData({ ...formData, skills: [...formData.skills, newSkill] });
            }
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillToRemove) });
    };

    const handleSaveOffer = async (e) => {
        e.preventDefault();
        setOfferSaving(true);
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                type: formData.type,
                workMode: formData.workMode,
                location: formData.wilaya,
                duration: formData.duration,
                startDate: formData.startDate,
                endDate: formData.endDate,
                technologies: formData.skills
            };

            if (modalMode === 'create') {
                await axiosInstance.post('/offers', payload);
                toast.success('Offer published successfully!');
            } else {
                await axiosInstance.put(`/offers/${formData.id}`, payload);
                toast.success('Offer updated successfully!');
            }
            fetchOffers();
            closeModal();
        } catch (e) {
            console.error("SAVE OFFER ERROR:", e);
            toast.error(e.response?.data?.message || 'Failed to save offer');
        } finally {
            setOfferSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            await axiosInstance.delete(`/offers/${id}`);
            setOffers(prev => prev.filter(o => o.id !== id));
            toast.success('Offer deleted');
        } catch (e) {
            console.error("DELETE OFFER ERROR:", e);
            toast.error('Failed to delete offer');
        } finally {
            setDeletingId(null);
            setConfirmDeleteId(null);
        }
    };

    return (
        <div className="space-y-6 fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Internship Offers</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage and track your active postings</p>
                </div>
                <button
                    onClick={() => openModal('create')}
                    className="flex items-center px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:scale-[1.02]"
                >
                    <Plus className="w-5 h-5 mr-2" /> New Offer
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white/5 animate-pulse rounded-xl"></div>)}
                </div>
            ) : offers.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none">
                    <Briefcase className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No offers posted yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first internship offer to start finding talent.</p>
                    <button
                        onClick={() => openModal('create')}
                        className="inline-flex items-center px-5 py-2.5 border border-teal-500/50 bg-teal-50 dark:bg-teal-500/10 hover:bg-teal-100 dark:hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 font-bold rounded-lg transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Create Offer
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.map(offer => (
                        <div key={offer.id} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 hover:border-teal-500/30 transition-all flex flex-col pt-6 relative group shadow-sm dark:shadow-none">

                            {/* Header logic (edit/delete overlay buttons) */}
                            <div className="absolute top-4 right-4 flex space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openModal('edit', offer)}
                                    className="p-2 bg-gray-100 dark:bg-white/10 hover:bg-teal-50 dark:hover:bg-teal-500/20 text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors border border-gray-200 dark:border-white/10"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setConfirmDeleteId(offer.id === confirmDeleteId ? null : offer.id)}
                                    className="p-2 bg-gray-100 dark:bg-white/10 hover:bg-red-50 dark:hover:bg-red-500/20 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors border border-gray-200 dark:border-white/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {confirmDeleteId === offer.id && (
                                <div className="absolute inset-0 bg-[#0F1C2E]/95 rounded-xl z-10 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm border border-red-500/30">
                                    <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
                                    <h4 className="text-white font-bold mb-2">Delete Offer?</h4>
                                    <p className="text-sm text-gray-400 mb-5">Are you sure you want to delete "{offer.title}"? This cannot be undone.</p>
                                    <div className="flex gap-3 w-full">
                                        <button
                                            onClick={() => setConfirmDeleteId(null)}
                                            className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleDelete(offer.id)}
                                            disabled={deletingId === offer.id}
                                            className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors flex justify-center"
                                        >
                                            {deletingId === offer.id ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete!'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 pr-16">{offer.title}</h3>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-white/10 rounded text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10">
                                    <Briefcase className="w-3.5 h-3.5 mr-1 text-teal-600 dark:text-teal-400" /> {offer.type}
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${offer.workMode === 'on-site' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' : offer.workMode === 'remote' ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20' : 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20'}`}>
                                    {offer.workMode === 'on-site' ? '🏢' : offer.workMode === 'remote' ? '🏠' : '🔀'} {offer.workMode.charAt(0).toUpperCase() + offer.workMode.slice(1)}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-white/10 rounded text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10">
                                    <MapPin className="w-3.5 h-3.5 mr-1 text-blue-600 dark:text-blue-400" /> {offer.wilaya}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-white/10 rounded text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10">
                                    <Calendar className="w-3.5 h-3.5 mr-1 text-pink-600 dark:text-pink-400" /> {offer.duration}
                                </span>
                                {offer.startDate && offer.endDate && (
                                    <span className="inline-flex items-center px-2 py-1 bg-amber-50 dark:bg-amber-500/10 rounded text-xs font-medium text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                        <Calendar className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-amber-400" /> 
                                        {new Date(offer.startDate).toLocaleDateString('en-GB')} - {new Date(offer.endDate).toLocaleDateString('en-GB')}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                                {offer.skills.map(s => (
                                    <span key={s} className="px-2 py-0.5 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded text-[10px] font-bold border border-teal-100 dark:border-teal-500/20">
                                        <Code className="w-3 h-3 inline-block mr-1" />{s}
                                    </span>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-sm">
                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                    <Users className="w-4 h-4 mr-2" />
                                    <span className="text-gray-900 dark:text-white font-bold mr-1">{offer.applicantsCount}</span> applicants
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Offer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="bg-white dark:bg-[#0F1C2E] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-2xl relative z-10 shadow-2xl flex flex-col max-h-[90vh]">

                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {modalMode === 'create' ? 'Create New Offer' : 'Edit Offer'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            <form id="offerForm" onSubmit={handleSaveOffer} className="space-y-5">

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Offer Title</label>
                                    <input
                                        type="text"
                                        required
                                        name="title"
                                        value={formData.title}
                                        onChange={handleFormChange}
                                        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none"
                                        placeholder="e.g. Frontend Engineering Intern"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</label>
                                    <textarea
                                        required
                                        name="description"
                                        value={formData.description}
                                        onChange={handleFormChange}
                                        rows="4"
                                        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none resize-none"
                                        placeholder="Describe the role and responsibilities..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center">
                                            <Briefcase className="w-4 h-4 mr-2" /> Internship Type
                                        </label>
                                        <div className="flex p-1 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                                            {['PFE', 'Summer', 'Part-time'].map(t => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, type: t })}
                                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${formData.type === t ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center">
                                            <Calendar className="w-4 h-4 mr-2" /> Duration
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleFormChange}
                                            className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none"
                                            placeholder="e.g. 3 months"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Start Date</label>
                                        <input
                                            type="date"
                                            required
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleFormChange}
                                            className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">End Date</label>
                                        <input
                                            type="date"
                                            required
                                            name="endDate"
                                            value={formData.endDate}
                                            min={formData.startDate}
                                            onChange={handleFormChange}
                                            className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Work Mode</label>
                                    <div className="flex p-1 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                                        {[
                                            { id: 'on-site', label: '🏢 On-site' },
                                            { id: 'remote', label: '🏠 Remote' },
                                            { id: 'hybrid', label: '🔀 Hybrid' }
                                        ].map(m => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, workMode: m.id })}
                                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${formData.workMode === m.id ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                            >
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center">
                                        <MapPin className="w-4 h-4 mr-2" /> Wilaya
                                    </label>
                                    <select
                                        required
                                        name="wilaya"
                                        value={formData.wilaya}
                                        onChange={handleFormChange}
                                        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none appearance-none"
                                    >
                                        <option value="" disabled>Select Wilaya</option>
                                        {ALGERIAN_WILAYAS.map((w, i) => (
                                            <option key={i} value={w} className="bg-white dark:bg-[#1E3A5F] text-gray-900 dark:text-white">{String(i + 1).padStart(2, '0')} - {w}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tech Skills</label>
                                    <div className="w-full min-h-[50px] bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-2 flex flex-wrap gap-2 items-center focus-within:ring-1 focus-within:ring-teal-500">
                                        {formData.skills.map(skill => (
                                            <span key={skill} className="flex items-center px-2 py-1 bg-teal-50 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded text-sm group transition-colors border border-teal-100 dark:border-teal-500/10">
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() => removeSkill(skill)}
                                                    className="ml-1.5 focus:outline-none"
                                                >
                                                    <X className="w-3 h-3 group-hover:text-red-500 dark:group-hover:text-white" />
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            onKeyDown={handleAddSkill}
                                            placeholder={formData.skills.length === 0 ? "Type a skill and press Enter" : ""}
                                            className="flex-1 min-w-[150px] bg-transparent outline-none text-sm text-gray-900 dark:text-white px-2 placeholder-gray-400 dark:placeholder-gray-500"
                                        />
                                    </div>
                                </div>

                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 dark:border-white/10 flex justify-end gap-3 bg-gray-50 dark:bg-white/5 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                disabled={offerSaving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="offerForm"
                                disabled={offerSaving}
                                className="flex items-center justify-center px-6 py-2.5 rounded-lg bg-teal-600 dark:bg-teal-500 hover:bg-teal-500 dark:hover:bg-teal-400 text-white font-bold transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] min-w-[140px]"
                            >
                                {offerSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (modalMode === 'create' ? 'Publish Offer' : 'Save Changes')}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default MyOffers;
