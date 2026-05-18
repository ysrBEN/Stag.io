import { useState, useEffect } from 'react';
import { User, Mail, GraduationCap, GitBranch, Link as LinkIcon, Loader2, X, Plus, Brain, CheckCircle, AlertTriangle, Target, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import useAuth from '../../hooks/useAuth';
import { ALGERIAN_WILAYAS } from '../../constants/wilayas';
import { compressImage } from '../../utils/imageUtils';

const StudentProfile = () => {
    const { user, login } = useAuth();

    // States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);

    // Form fields
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        university: '',
        fieldOfStudy: '',
        academicYear: '',
        github: '',
        portfolio: '',
        bio: '',
        wilaya: '',
        profilePicture: ''
    });

    // Skills tags
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosInstance.get('/student/profile');
                console.log("STUDENT PROFILE API RESPONSE:", res.data); // 🔍 Debug log
                const data = res.data;
                if (data) {
                    setFormData({
                        name: data.name || '',
                        email: data.email || '',
                        university: data.university || '',
                        fieldOfStudy: data.fieldOfStudy || '',
                        academicYear: data.academicYear || '',
                        github: data.githubUrl || '',
                        portfolio: data.portfolioUrl || '',
                        bio: data.bio || '',
                        wilaya: data.wilaya || '',
                        profilePicture: data.profilePicture || ''
                    });
                    setSkills(data.skills || []);
                }
                setLoading(false);
            } catch (err) {
                console.error("PROFILE FETCH ERROR:", err);
                toast.error("Failed to load profile");
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSkill = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newSkill = skillInput.trim();
            if (newSkill && !skills.includes(newSkill)) {
                setSkills([...skills, newSkill]);
                setSkillInput('');
            } else if (skills.includes(newSkill)) {
                toast.error("Skill already added");
            }
        }
    };

    const removeSkill = (skillToRemove) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name: formData.name,
                university: formData.university,
                fieldOfStudy: formData.fieldOfStudy,
                academicYear: formData.academicYear,
                githubUrl: formData.github,
                portfolioUrl: formData.portfolio,
                bio: formData.bio,
                wilaya: formData.wilaya,
                profilePicture: formData.profilePicture,
                skills
            };

            const res = await axiosInstance.put('/student/profile', payload);

            // Update local context if name or picture changed
            const updatedUser = { ...user, name: formData.name, profilePicture: formData.profilePicture };
            login(updatedUser, localStorage.getItem('token'));

            toast.success("Profile updated successfully ✅");
            setSaving(false);
        } catch (err) {
            console.error("PROFILE UPDATE ERROR:", err);
            toast.error("Failed to update profile");
            setSaving(false);
        }
    };

    const handleAnalyzeProfile = async () => {
        setAnalysisLoading(true);
        try {
            const res = await axiosInstance.post('/ai/analyze-profile');
            setAnalysisResult(res.data);
            setShowAnalysisModal(true);
        } catch (err) {
            console.error("AI Analysis error:", err);
            toast.error("Failed to analyze profile with AI");
        } finally {
            setAnalysisLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-teal-400" />
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 fade-in-up">

            {/* Left Column - View Profile */}
            <div className="w-full lg:w-1/3">
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 text-center shadow-xl sticky top-6 shadow-sm dark:shadow-none">
                    <div className="relative inline-block w-24 h-24 mb-4">
                        <div className="w-full h-full rounded-full bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 dark:border-teal-500/50 flex items-center justify-center text-4xl font-bold shadow-[0_0_20px_rgba(20,184,166,0.15)] dark:shadow-[0_0_20px_rgba(20,184,166,0.3)] backdrop-blur-md overflow-hidden">
                            {formData.profilePicture ? (
                                <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                formData.name.charAt(0)
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-[#0F1C2E] border border-gray-200 dark:border-white/20 rounded-full text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors shadow-sm cursor-pointer group">
                            <Plus className="w-4 h-4" />
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        try {
                                            const base64 = await compressImage(e.target.files[0]);
                                            setFormData(prev => ({ ...prev, profilePicture: base64 }));
                                            // Automatically save on picture change (optional, but good UX)
                                        } catch (err) {
                                            toast.error('Failed to process image');
                                        }
                                    }
                                }} 
                            />
                        </label>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{formData.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center mb-1">
                        <GraduationCap className="w-4 h-4 mr-1.5 text-teal-500" /> {formData.university}
                    </p>
                    <p className="text-xs text-teal-600 dark:text-teal-400/80 mb-6 font-medium">
                        {formData.fieldOfStudy} • {formData.academicYear}
                        {formData.wilaya && ` • ${formData.wilaya}`}
                    </p>

                    {formData.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 text-left bg-gray-50 dark:bg-white/5 p-4 rounded-xl mb-6 italic border-l-4 border-teal-500/50">
                            "{formData.bio}"
                        </p>
                    )}

                    <div className="space-y-3 text-sm text-left">
                        <div className="flex items-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                            <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3 shrink-0" />
                            <span className="truncate">{formData.email}</span>
                        </div>

                        {formData.github && (
                            <a href={formData.github} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group">
                                <GitBranch className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3 shrink-0 group-hover:text-teal-500" />
                                <span className="truncate">GitHub Profile</span>
                            </a>
                        )}

                        {formData.portfolio && (
                            <a href={formData.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group">
                                <LinkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3 shrink-0 group-hover:text-teal-500" />
                                <span className="truncate">Portfolio</span>
                            </a>
                        )}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                        {skills.map(skill => (
                            <span key={skill} className="px-2.5 py-1 text-xs bg-teal-500/10 text-teal-600 dark:text-teal-300 rounded border border-teal-500/20">
                                {skill}
                            </span>
                        ))}
                    </div>

                </div>
            </div>

            {/* Right Column - Edit Form */}
            <div className="w-full lg:w-2/3">
                <div className="bg-white dark:bg-[#0F1C2E] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-white/10">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                            <User className="w-5 h-5 mr-2 text-teal-500" /> Edit Profile
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white dark:bg-[#0F1C2E] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none placeholder-gray-400 dark:placeholder-gray-600"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email (Readonly)</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    readOnly
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2 space-y-1">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">University</label>
                                <input
                                    type="text"
                                    name="university"
                                    value={formData.university}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white dark:bg-[#0F1C2E] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none placeholder-gray-400 dark:placeholder-gray-600"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Field of Study</label>
                                <input
                                    type="text"
                                    name="fieldOfStudy"
                                    value={formData.fieldOfStudy}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white dark:bg-[#0F1C2E] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none placeholder-gray-400 dark:placeholder-gray-600"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Academic Year</label>
                                <select
                                    name="academicYear"
                                    value={formData.academicYear}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white dark:bg-[#0F1C2E] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none appearance-none"
                                >
                                    <option value="" disabled>Select Year</option>
                                    <option value="L1">L1 - License 1</option>
                                    <option value="L2">L2 - License 2</option>
                                    <option value="L3">L3 - License 3</option>
                                    <option value="M1">M1 - Master 1</option>
                                    <option value="M2">M2 - Master 2</option>
                                    <option value="PhD">PhD</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Wilaya</label>
                                <select
                                    name="wilaya"
                                    value={formData.wilaya}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white dark:bg-[#0F1C2E] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none appearance-none"
                                >
                                    <option value="" disabled>Select Wilaya</option>
                                    {ALGERIAN_WILAYAS.map(w => (
                                        <option key={w} value={w} className="text-gray-900 dark:text-white bg-white dark:bg-[#0F1C2E]">{w}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tech Skills</label>
                            <div className="w-full min-h-[50px] bg-white dark:bg-[#0F1C2E] border border-gray-300 dark:border-white/10 rounded-lg p-2 flex flex-wrap gap-2 items-center focus-within:ring-1 focus-within:ring-teal-500 shadow-inner">
                                {skills.map(skill => (
                                    <span key={skill} className="flex items-center px-2 py-1 bg-teal-50 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-500/30 rounded text-sm group transition-colors">
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => removeSkill(skill)}
                                            className="ml-1.5 focus:outline-none"
                                        >
                                            <X className="w-3 h-3 group-hover:text-teal-900 dark:group-hover:text-white" />
                                        </button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={handleAddSkill}
                                    placeholder={skills.length === 0 ? "Type a skill and press Enter" : ""}
                                    className="flex-1 min-w-[200px] bg-transparent outline-none text-sm text-gray-900 dark:text-white px-2 placeholder-gray-400 dark:placeholder-gray-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">GitHub URL</label>
                                <div className="relative">
                                    <GitBranch className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                    <input
                                        type="url"
                                        name="github"
                                        value={formData.github}
                                        onChange={handleChange}
                                        className="w-full bg-white dark:bg-[#0F1C2E] border border-gray-300 dark:border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none placeholder-gray-400 dark:placeholder-gray-600"
                                        placeholder="https://github.com/..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Portfolio URL</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                    <input
                                        type="url"
                                        name="portfolio"
                                        value={formData.portfolio}
                                        onChange={handleChange}
                                        className="w-full bg-white dark:bg-[#0F1C2E] border border-gray-300 dark:border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none placeholder-gray-400 dark:placeholder-gray-600"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bio / About Me</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={4}
                                className="w-full bg-white dark:bg-[#0F1C2E] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 outline-none resize-y placeholder-gray-400 dark:placeholder-gray-600"
                                placeholder="Tell companies a little about yourself..."
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex justify-end flex-col sm:flex-row sm:items-center gap-3">
                            <button
                                type="button"
                                onClick={handleAnalyzeProfile}
                                disabled={analysisLoading}
                                className="flex justify-center items-center py-2.5 px-6 border border-teal-500 rounded-lg shadow-sm text-sm font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 w-full sm:w-auto"
                            >
                                {analysisLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
                                {analysisLoading ? 'Analyzing your profile...' : 'Analyze my Profile with AI'}
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex justify-center items-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:brightness-110 transition-all duration-200 shadow-[0_0_10px_rgba(20,184,166,0.2)]"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            {/* AI Analysis Modal */}
            {showAnalysisModal && analysisResult && (
                <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-[#0F1C2E] border border-gray-300 dark:border-white/10 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-fade-in-up">
                        <button onClick={() => setShowAnalysisModal(false)} className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                        <div className="flex items-center space-x-3 mb-6 border-b border-gray-200 dark:border-white/10 pb-4">
                            <Brain className="w-8 h-8 text-teal-500 dark:text-teal-400" />
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Profile Analysis</h2>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 mb-6">
                            <div className="flex-shrink-0 flex justify-center items-center">
                                <div className="relative w-32 h-32">
                                    <svg viewBox="0 0 36 36" className={`w-32 h-32 ${analysisResult.score < 40 ? 'text-red-500' : analysisResult.score < 70 ? 'text-yellow-500' : 'text-green-500'}`}>
                                        <path
                                            className="text-gray-200 dark:text-gray-700"
                                            strokeWidth="4"
                                            stroke="currentColor"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                        <path
                                            className="text-current"
                                            strokeDasharray={`${analysisResult.score}, 100`}
                                            strokeLinecap="round"
                                            strokeWidth="4"
                                            stroke="currentColor"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-gray-900 dark:text-white">{analysisResult.score}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <h3 className={`text-2xl font-bold ${analysisResult.score < 40 ? 'text-red-600 dark:text-red-400' : analysisResult.score < 70 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                                    {analysisResult.scoreLabel}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm max-w-sm border-l-2 pl-3 border-teal-500/50">
                                    <Lightbulb className="w-4 h-4 inline mr-1 text-teal-500" />
                                    {analysisResult.advice}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="flex items-center text-green-600 dark:text-green-400 font-semibold mb-3"><CheckCircle className="w-5 h-5 mr-2" /> Strengths</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-2 font-medium">
                                    {analysisResult.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="flex items-center text-yellow-600 dark:text-yellow-400 font-semibold mb-3"><AlertTriangle className="w-5 h-5 mr-2" /> Improvements</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-2 font-medium">
                                    {analysisResult.improvements?.map((imp, i) => <li key={i}>{imp}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-teal-600 dark:text-teal-400 font-semibold mb-3 flex items-center">🛠️ Missing Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysisResult.missingSkills?.map((ms, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setSkillInput(ms); setShowAnalysisModal(false); }}
                                            className="px-3 py-1 bg-teal-500/10 text-teal-300 border border-teal-500/30 rounded-full text-xs hover:bg-teal-500/20 transition-colors cursor-pointer group flex items-center"
                                        >
                                            <Plus className="w-3 h-3 mr-1 opacity-50 group-hover:opacity-100" /> {ms}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Click a missing skill to add it to your input field.</p>
                            </div>
                            <div>
                                <h4 className="flex items-center text-blue-400 font-semibold mb-3"><Target className="w-5 h-5 mr-2" /> Recommended Offers</h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysisResult.recommendedOffers?.map((ro, i) => (
                                        <a href="/student/search" key={i} className="px-3 py-1.5 bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded text-sm hover:bg-blue-500/20 transition-colors">
                                            {ro}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProfile;
