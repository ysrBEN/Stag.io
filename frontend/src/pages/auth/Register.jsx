import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft,
    GraduationCap, Building2, Briefcase
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import useAuth from '../../hooks/useAuth';
import AuthBackground from '../../components/AuthBackground';
import toast from 'react-hot-toast';
import { ALGERIAN_WILAYAS } from '../../constants/wilayas';
import { GoogleLogin } from '@react-oauth/google';
import GoogleRoleModal from '../../components/GoogleRoleModal';
import { compressImage } from '../../utils/imageUtils';



const Register = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Step 1 states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState(''); // student | company | admin
    const [profilePicture, setProfilePicture] = useState('');

    // Step 2 states
    // Student
    const [university, setUniversity] = useState('');
    const [fieldOfStudy, setFieldOfStudy] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    // Company
    const [companyName, setCompanyName] = useState('');
    const [wilaya, setWilaya] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [industry, setIndustry] = useState('');
    // Admin
    const [department, setDepartment] = useState('');
    const [staffId, setStaffId] = useState('');
    // Skills
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [customSkill, setCustomSkill] = useState('');

    const PREDEFINED_SKILLS = [
        'React', 'Node.js', 'Python', 'Java', 'Laravel', 'Django',
        'Flutter', 'SQL', 'MongoDB', 'Express', 'Vue.js', 'Angular',
        'Docker', 'Git', 'TypeScript', 'PHP', 'Spring Boot', 'FastAPI'
    ];

    const navigate = useNavigate();
    const { login } = useAuth();
    
    // Google Auth State
    const [googleCredential, setGoogleCredential] = useState(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleNextStep = () => {
        if (!name || !email || !password || !confirmPassword || !role) {
            toast.error("Please fill in all fields");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        setStep(2);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            name,
            email,
            password,
            role,
            profilePicture,
            ...(role === 'student' && { university, fieldOfStudy, academicYear, wilaya, skills: selectedSkills }),
            ...(role === 'company' && { companyName, wilaya, websiteUrl, industry }),
            ...(role === 'admin' && { department, staffId }),
        };

        try {
            const response = await axiosInstance.post('/auth/register', payload);
            const { token, user } = response.data;

            if (role === 'admin') {
                // Admin accounts are auto-approved — log them in immediately
                login(user, token);
                toast.success('Admin account created!');
                navigate('/admin/dashboard');
            } else {
                // Students & companies must wait for admin approval
                toast.success('Account created! Awaiting admin approval.');
                navigate('/pending-approval');
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const { credential } = credentialResponse;
            const res = await axiosInstance.post('/auth/google', { credential });
            
            if (res.data.isNewUser) {
                setGoogleCredential(credential);
                setShowRoleModal(true);
            } else {
                const { token, user } = res.data;
                login(user, token);
                toast.success('Logged in successfully');
                if (user.role === 'student') navigate('/student/dashboard');
                else if (user.role === 'company') navigate('/company/dashboard');
                else if (user.role === 'admin') navigate('/admin/dashboard');
                else navigate('/');
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error('Google Login failed.');
            }
        }
    };

    const handleGoogleRoleSubmit = async (payload) => {
        try {
            setGoogleLoading(true);
            const res = await axiosInstance.post('/auth/google-register', { 
                credential: googleCredential, 
                ...payload 
            });
            const { token, user } = res.data;
            login(user, token);
            setShowRoleModal(false);
            
            if (user.status === 'pending') {
                 toast.success('Account created! Awaiting admin approval.');
                 navigate('/pending-approval');
            } else {
                toast.success('Account created successfully');
                if (user.role === 'student') navigate('/student/dashboard');
                else if (user.role === 'company') navigate('/company/dashboard');
                else navigate('/');
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error('Registration failed.');
            }
            setShowRoleModal(false);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <AuthBackground>
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Create Account</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Join Stag.io network today</p>
            </div>

            <div className="bg-white dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 shadow-xl dark:shadow-none rounded-2xl p-8 relative overflow-hidden">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                    <div
                        className="h-full bg-teal-500 transition-all duration-500 ease-in-out"
                        style={{ width: step === 1 ? '50%' : '100%' }}
                    />
                </div>

                {/* Step 1: Basic Info */}
                <div className={`transition-all duration-500 ${step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-[150%] absolute right-8 left-8 pointer-events-none'}`}>
                    <div className="space-y-4">
                        
                        {/* Profile Picture Upload */}
                        <div className="flex flex-col items-center mb-4">
                            <label className="relative cursor-pointer group">
                                <div className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${profilePicture ? 'border-teal-500' : 'border-gray-300 dark:border-gray-600 group-hover:border-teal-500'}`}>
                                    {profilePicture ? (
                                        <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-8 h-8 text-gray-400 group-hover:text-teal-500 transition-colors" />
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-medium">Upload</span>
                                </div>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={async (e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            try {
                                                const base64 = await compressImage(e.target.files[0]);
                                                setProfilePicture(base64);
                                            } catch (err) {
                                                toast.error('Failed to process image');
                                            }
                                        }
                                    }} 
                                />
                            </label>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">Optional avatar</span>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full pl-10 pr-8 py-2.5 border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">I am a...</p>
                            <div className="grid gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('student')}
                                    className={`flex items-center p-3 rounded-lg border transition-all ${role === 'student' ? 'border-teal-500 bg-teal-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                                >
                                    <GraduationCap className={`w-6 h-6 mr-3 ${role === 'student' ? 'text-teal-400' : 'text-gray-400'}`} />
                                    <div className="text-left">
                                        <div className="text-gray-900 dark:text-white font-medium">Student</div>
                                        <div className="text-gray-500 dark:text-gray-400 text-xs">Looking for an internship</div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setRole('company')}
                                    className={`flex items-center p-3 rounded-lg border transition-all ${role === 'company' ? 'border-teal-500 bg-teal-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                                >
                                    <Building2 className={`w-6 h-6 mr-3 ${role === 'company' ? 'text-teal-400' : 'text-gray-400'}`} />
                                    <div className="text-left">
                                        <div className="text-gray-900 dark:text-white font-medium">Company</div>
                                        <div className="text-gray-500 dark:text-gray-400 text-xs">Looking for talent</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleNextStep}
                            className="mt-6 w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 hover:scale-[1.02] hover:brightness-110 transition-all duration-200"
                        >
                            Next Step <ArrowRight className="ml-2 w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Step 2: Role Details */}
                <div className={`transition-all duration-500 ${step === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[150%] absolute right-8 left-8 pointer-events-none'}`}>
                    <form onSubmit={handleRegister} className="space-y-4">

                        {role === 'student' && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">University Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={university}
                                        onChange={(e) => setUniversity(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Field of Study</label>
                                    <input
                                        type="text"
                                        required
                                        value={fieldOfStudy}
                                        onChange={(e) => setFieldOfStudy(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Academic Year</label>
                                    <select
                                        required
                                        value={academicYear}
                                        onChange={(e) => setAcademicYear(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all appearance-none"
                                    >
                                        <option value="" disabled className="bg-[#1E3A5F]">Select Year</option>
                                        <option value="L1" className="bg-[#1E3A5F]">L1 - License 1</option>
                                        <option value="L2" className="bg-[#1E3A5F]">L2 - License 2</option>
                                        <option value="L3" className="bg-[#1E3A5F]">L3 - License 3</option>
                                        <option value="M1" className="bg-[#1E3A5F]">M1 - Master 1</option>
                                        <option value="M2" className="bg-[#1E3A5F]">M2 - Master 2</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Wilaya</label>
                                    <select
                                        required
                                        value={wilaya}
                                        onChange={(e) => setWilaya(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all appearance-none"
                                    >
                                        <option value="" disabled className="bg-white dark:bg-[#1E3A5F] text-gray-900 dark:text-white">Select Wilaya</option>
                                        {ALGERIAN_WILAYAS.map((w, index) => (
                                            <option key={index} value={w} className="bg-white dark:bg-[#1E3A5F] text-gray-900 dark:text-white">{String(index + 1).padStart(2, '0')} - {w}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tech Skills <span className="text-gray-500 font-normal lowercase">(Optional)</span></label>
                                        <span className="text-[10px] text-gray-500">{selectedSkills.length} selected</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                                        {PREDEFINED_SKILLS.map(skill => (
                                            <button
                                                key={skill}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedSkills(prev =>
                                                        prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
                                                    );
                                                }}
                                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${selectedSkills.includes(skill) ? 'bg-teal-500/20 border-teal-500/50 text-teal-400' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                                            >
                                                {skill}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Add a custom skill... (Press Enter)"
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
                                            className="block w-full pl-3 pr-10 py-2 border border-white/10 rounded-lg bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <kbd className="text-[10px] text-gray-600 border border-white/10 px-1 rounded">Enter</kbd>
                                        </div>
                                    </div>
                                    {selectedSkills.filter(s => !PREDEFINED_SKILLS.includes(s)).length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {selectedSkills.filter(s => !PREDEFINED_SKILLS.includes(s)).map(s => (
                                                <span key={s} className="px-2 py-1 bg-teal-500/10 border border-teal-500/30 rounded text-[10px] text-teal-400 flex items-center">
                                                    {s}
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedSkills(selectedSkills.filter(sk => sk !== s))}
                                                        className="ml-1.5 hover:text-white"
                                                    >
                                                        ×
                                                    </button>
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
                                    <label className="text-sm font-medium text-gray-300">Company Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Wilaya</label>
                                    <select
                                        required
                                        value={wilaya}
                                        onChange={(e) => setWilaya(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all max-h-40 overflow-y-auto"
                                    >
                                        <option value="" disabled className="bg-[#1E3A5F]">Select Wilaya</option>
                                        {ALGERIAN_WILAYAS.map((w, index) => (
                                            <option key={index} value={w} className="bg-[#1E3A5F]">{String(index + 1).padStart(2, '0')} - {w}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Industry</label>
                                    <select
                                        required
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all appearance-none"
                                    >
                                        <option value="" disabled className="bg-[#1E3A5F]">Select Industry</option>
                                        <option value="IT & Software" className="bg-[#1E3A5F]">IT & Software</option>
                                        <option value="Automotive" className="bg-[#1E3A5F]">Automotive</option>
                                        <option value="Finance" className="bg-[#1E3A5F]">Finance</option>
                                        <option value="Education" className="bg-[#1E3A5F]">Education</option>
                                        <option value="Other" className="bg-[#1E3A5F]">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Company Website (Optional)</label>
                                    <input
                                        type="url"
                                        value={websiteUrl}
                                        onChange={(e) => setWebsiteUrl(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                        placeholder="https://"
                                    />
                                </div>
                            </>
                        )}

                        {role === 'admin' && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Department</label>
                                    <input
                                        type="text"
                                        required
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Staff ID</label>
                                    <input
                                        type="text"
                                        required
                                        value={staffId}
                                        onChange={(e) => setStaffId(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                    />
                                </div>
                            </>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex items-center justify-center py-2.5 px-4 border border-white/20 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-all"
                            >
                                <ArrowLeft className="mr-2 w-4 h-4" /> Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:brightness-110 transition-all duration-200"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div >

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-[#1A2639] text-gray-500">Or continue with</span>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => {
                                toast.error('Google Login failed');
                            }}
                            theme="outline"
                            size="large"
                            text="continue_with"
                            shape="rectangular"
                            width="100%"
                        />
                    </div>
                </div>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Already have an account? </span>
                    <Link to="/login" className="font-medium text-teal-400 hover:text-teal-300 transition-colors">
                        Login
                    </Link>
                </div>
            </div >
            <GoogleRoleModal 
                isOpen={showRoleModal} 
                onClose={() => setShowRoleModal(false)} 
                onSubmit={handleGoogleRoleSubmit} 
                loading={googleLoading}
            />
        </AuthBackground >
    );
};

export default Register;
