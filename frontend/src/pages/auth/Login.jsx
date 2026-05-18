import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, Loader2, Clock, XCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import axiosInstance from '../../api/axiosInstance';
import useAuth from '../../hooks/useAuth';
import AuthBackground from '../../components/AuthBackground';
import GoogleRoleModal from '../../components/GoogleRoleModal';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);
    
    // Google Auth State
    const [googleCredential, setGoogleCredential] = useState(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axiosInstance.post('/auth/login', { email, password });
            // Assume response.data contains { token, user }
            const { token, user } = response.data;

            login(user, token);

            // Redirect to dashboard based on role
            if (user.role === 'student') navigate('/student/dashboard');
            else if (user.role === 'company') navigate('/company/dashboard');
            else if (user.role === 'admin') navigate('/admin/dashboard');
            else navigate('/'); // Fallback

        } catch (err) {
            setShake(true);
            setTimeout(() => setShake(false), 500);

            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('An error occurred during login.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setError('');
            const { credential } = credentialResponse;
            const res = await axiosInstance.post('/auth/google', { credential });
            
            if (res.data.isNewUser) {
                setGoogleCredential(credential);
                setShowRoleModal(true);
            } else {
                const { token, user } = res.data;
                login(user, token);
                if (user.role === 'student') navigate('/student/dashboard');
                else if (user.role === 'company') navigate('/company/dashboard');
                else if (user.role === 'admin') navigate('/admin/dashboard');
                else navigate('/');
            }
        } catch (err) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Google Login failed.');
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
            
            // Redirect to appropriate dashboard, or maybe pending page
            if (user.status === 'pending') {
                 // Usually we might log out or show pending, but we'll navigate and let AuthGuard handle it
                 navigate('/');
            } else {
                if (user.role === 'student') navigate('/student/dashboard');
                else if (user.role === 'company') navigate('/company/dashboard');
                else navigate('/');
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Registration failed.');
            }
            setShowRoleModal(false);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <AuthBackground>
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-teal-500/20 mb-4">
                    <GraduationCap className="w-10 h-10 text-teal-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Stag.io</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Your gateway to professional opportunities</p>
            </div>

            <div className={`bg-white dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 shadow-xl dark:shadow-none rounded-2xl p-8 ${shake ? 'shake' : ''}`}>
                {error && (() => {
                    const isPending = error.toLowerCase().includes('pending');
                    const isRejected = error.toLowerCase().includes('rejected');
                    return (
                        <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3
                            ${isPending ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' : ''}
                            ${isRejected ? 'bg-red-500/10 border-red-500/30 text-red-300' : ''}
                            ${!isPending && !isRejected ? 'bg-red-500/10 border-red-500/30 text-red-300' : ''}`}
                        >
                            {isPending
                                ? <Clock className="w-5 h-5 shrink-0 mt-0.5 text-yellow-400" />
                                : <XCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                            <div>
                                <p className="font-semibold text-sm">
                                    {isPending ? 'Account Pending Approval' : ''}
                                    {isRejected ? 'Account Rejected' : ''}
                                    {!isPending && !isRejected ? 'Login Failed' : ''}
                                </p>
                                <p className="text-xs mt-0.5 opacity-80">{error}</p>
                                {isPending && (
                                    <p className="text-xs mt-1.5 opacity-70">
                                        Please wait for an administrator to review your account.
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })()}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">
                            <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 text-teal-500 shadow-sm focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50 focus:ring-offset-0 bg-transparent mr-2" />
                            Remember me
                        </label>
                        <Link to="/forgot-password" className="font-medium text-teal-400 hover:text-teal-300 transition-colors">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:ring-offset-[#0F1C2E] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:brightness-110 transition-all duration-200"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign in to your account'}
                    </button>
                </form>

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
                                setShake(true);
                                setTimeout(() => setShake(false), 500);
                                setError('Google Login failed');
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
                    <span className="text-gray-400">Don't have an account? </span>
                    <Link to="/register" className="font-medium text-teal-400 hover:text-teal-300 transition-colors">
                        Register here
                    </Link>
                </div>
            </div>
            
            <GoogleRoleModal 
                isOpen={showRoleModal} 
                onClose={() => setShowRoleModal(false)} 
                onSubmit={handleGoogleRoleSubmit} 
                loading={googleLoading}
            />
        </AuthBackground>
    );
};

export default Login;
