import React, { useState } from 'react';
import { Loader2, User as UserIcon, Building2, ArrowLeft } from 'lucide-react';
import { ALGERIAN_WILAYAS } from '../constants/wilayas';

const PREDEFINED_SKILLS = [
    'React', 'Node.js', 'Python', 'Java', 'Laravel', 'Django',
    'Flutter', 'SQL', 'MongoDB', 'Express', 'Vue.js', 'Angular',
    'Docker', 'Git', 'TypeScript', 'PHP', 'Spring Boot', 'FastAPI'
];

const GoogleRoleModal = ({ isOpen, onClose, onSubmit, loading }) => {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('');

    // Student fields
    const [university, setUniversity] = useState('');
    const [fieldOfStudy, setFieldOfStudy] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [customSkill, setCustomSkill] = useState('');
    
    // Company fields
    const [companyName, setCompanyName] = useState('');
    const [industry, setIndustry] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    
    // Shared fields
    const [wilaya, setWilaya] = useState('');

    if (!isOpen) return null;

    const handleNextStep = () => {
        if (!role) return;
        setStep(2);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const payload = {
            role,
            wilaya,
            ...(role === 'student' && { university, fieldOfStudy, academicYear, skills: selectedSkills }),
            ...(role === 'company' && { companyName, industry, websiteUrl })
        };
        
        onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1A2639] border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
                
                {step === 1 && (
                    <>
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Choose Your Role</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please select your account type to continue.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button
                                onClick={() => setRole('student')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                    role === 'student'
                                        ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-teal-500/50 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'
                                }`}
                            >
                                <UserIcon className="w-8 h-8 mb-2" />
                                <span className="font-medium">Student</span>
                            </button>

                            <button
                                onClick={() => setRole('company')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                    role === 'company'
                                        ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-teal-500/50 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'
                                }`}
                            >
                                <Building2 className="w-8 h-8 mb-2" />
                                <span className="font-medium">Company</span>
                            </button>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleNextStep}
                                disabled={!role}
                                className="flex-1 flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-teal-500 rounded-lg hover:bg-teal-600 disabled:opacity-50 transition-colors"
                            >
                                Next Step
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Complete Your Profile</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Just a few more details needed.</p>
                        </div>

                        {role === 'student' && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">University Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={university}
                                        onChange={(e) => setUniversity(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Field of Study</label>
                                    <input
                                        type="text"
                                        required
                                        value={fieldOfStudy}
                                        onChange={(e) => setFieldOfStudy(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Academic Year</label>
                                    <select
                                        required
                                        value={academicYear}
                                        onChange={(e) => setAcademicYear(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                    >
                                        <option value="" disabled>Select Year</option>
                                        <option value="L1">L1 - License 1</option>
                                        <option value="L2">L2 - License 2</option>
                                        <option value="L3">L3 - License 3</option>
                                        <option value="M1">M1 - Master 1</option>
                                        <option value="M2">M2 - Master 2</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Wilaya</label>
                                    <select
                                        required
                                        value={wilaya}
                                        onChange={(e) => setWilaya(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                    >
                                        <option value="" disabled>Select Wilaya</option>
                                        {ALGERIAN_WILAYAS.map((w, index) => (
                                            <option key={index} value={w}>{String(index + 1).padStart(2, '0')} - {w}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-3 pt-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tech Skills (Optional)</label>
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                        {PREDEFINED_SKILLS.map(skill => (
                                            <button
                                                key={skill}
                                                type="button"
                                                onClick={() => setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])}
                                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${selectedSkills.includes(skill) ? 'bg-teal-500/20 border-teal-500/50 text-teal-600 dark:text-teal-400' : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-teal-300'}`}
                                            >
                                                {skill}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Add custom skill (Press Enter)"
                                            value={customSkill}
                                            onChange={(e) => setCustomSkill(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const val = customSkill.trim();
                                                    if (val && !selectedSkills.includes(val)) {
                                                        setSelectedSkills([...selectedSkills, val]);
                                                        setCustomSkill('');
                                                    }
                                                }
                                            }}
                                            className="block w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                                        />
                                    </div>
                                    {selectedSkills.filter(s => !PREDEFINED_SKILLS.includes(s)).length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {selectedSkills.filter(s => !PREDEFINED_SKILLS.includes(s)).map(s => (
                                                <span key={s} className="px-2 py-1 bg-teal-500/10 border border-teal-500/30 rounded text-[10px] text-teal-600 dark:text-teal-400 flex items-center">
                                                    {s}
                                                    <button type="button" onClick={() => setSelectedSkills(selectedSkills.filter(sk => sk !== s))} className="ml-1.5 hover:text-red-500">×</button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {role === 'company' && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Wilaya</label>
                                    <select
                                        required
                                        value={wilaya}
                                        onChange={(e) => setWilaya(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                    >
                                        <option value="" disabled>Select Wilaya</option>
                                        {ALGERIAN_WILAYAS.map((w, index) => (
                                            <option key={index} value={w}>{String(index + 1).padStart(2, '0')} - {w}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Industry</label>
                                    <select
                                        required
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                    >
                                        <option value="" disabled>Select Industry</option>
                                        <option value="IT & Software">IT & Software</option>
                                        <option value="Automotive">Automotive</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Education">Education</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Website (Optional)</label>
                                    <input
                                        type="url"
                                        value={websiteUrl}
                                        onChange={(e) => setWebsiteUrl(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                        placeholder="https://"
                                    />
                                </div>
                            </>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex items-center justify-center py-2.5 px-4 border border-gray-200 dark:border-white/20 rounded-lg text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                            >
                                <ArrowLeft className="mr-2 w-4 h-4" /> Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 disabled:opacity-50 transition-all duration-200"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Complete Setup'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default GoogleRoleModal;
