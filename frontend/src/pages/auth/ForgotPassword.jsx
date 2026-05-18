import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import AuthBackground from '../../components/AuthBackground';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Form fields
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSendCode = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email");
            return;
        }
        
        setLoading(true);
        try {
            await axiosInstance.post('/auth/forgot-password', { email });
            toast.success("Verification code sent to your email!");
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send code");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        if (!code || code.length !== 6) {
            toast.error("Please enter the 6-digit code");
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post('/auth/verify-reset-code', { email, code });
            toast.success("Code verified!");
            setStep(3);
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid or expired code");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post('/auth/reset-password', { email, code, newPassword });
            toast.success("Password reset successfully! You can now log in.");
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthBackground>
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/10 mb-4">
                    <KeyRound className="w-8 h-8 text-teal-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {step === 1 ? 'Forgot Password' : step === 2 ? 'Verify Code' : 'Set New Password'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                    {step === 1 
                        ? "Enter your email to receive a reset code." 
                        : step === 2 
                        ? `We sent a 6-digit code to ${email}`
                        : "Create a new strong password."}
                </p>
            </div>

            <div className="bg-white dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 shadow-xl dark:shadow-none rounded-2xl p-8 relative overflow-hidden">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 dark:bg-white/10">
                    <div
                        className="h-full bg-teal-500 transition-all duration-500 ease-in-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                {/* Step 1: Email */}
                {step === 1 && (
                    <form onSubmit={handleSendCode} className="space-y-6 animate-fade-in-up">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Code'}
                        </button>

                        <div className="text-center mt-4">
                            <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-teal-500 flex items-center justify-center transition-colors">
                                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
                            </Link>
                        </div>
                    </form>
                )}

                {/* Step 2: Verify Code */}
                {step === 2 && (
                    <form onSubmit={handleVerifyCode} className="space-y-6 animate-fade-in-up">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">6-Digit Code</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. 123456"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    maxLength="6"
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-center tracking-[0.5em] font-bold text-lg"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
                        </button>
                        
                        <div className="text-center mt-4 text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Didn't receive the code? </span>
                            <button type="button" onClick={() => setStep(1)} className="text-teal-500 font-medium hover:underline">
                                Resend
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: Reset Password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-6 animate-fade-in-up">
                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </AuthBackground>
    );
};

export default ForgotPassword;
