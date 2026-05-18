import { Link } from 'react-router-dom';
import { Clock, ShieldCheck, Mail } from 'lucide-react';
import AuthBackground from '../../components/AuthBackground';

const PendingApproval = () => {
    return (
        <AuthBackground>
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-4 rounded-full bg-yellow-500/20 mb-5 ring-1 ring-yellow-500/30">
                    <Clock className="w-12 h-12 text-yellow-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Account Under Review</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Registration successful!</p>
            </div>

            <div className="bg-white dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 shadow-xl dark:shadow-none rounded-2xl p-8 space-y-6">
                {/* Status card */}
                <div className="bg-yellow-500/10 border border-yellow-500/25 rounded-xl p-5 flex items-start gap-4">
                    <ShieldCheck className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-yellow-600 dark:text-yellow-300 font-semibold text-sm">Pending Admin Approval</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 leading-relaxed">
                            Your account has been created and is now awaiting approval from a university administrator.
                            This usually takes <span className="text-gray-900 dark:text-white font-medium">1–2 business days</span>.
                        </p>
                    </div>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                    {[
                        { step: '1', label: 'Account created', done: true },
                        { step: '2', label: 'Admin reviews your application', done: false },
                        { step: '3', label: 'Receive approval & log in', done: false },
                    ].map(({ step, label, done }) => (
                        <div key={step} className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                                ${done
                                    ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/40'
                                    : 'bg-gray-50 dark:bg-white/5 text-gray-500 border border-gray-200 dark:border-white/10'}`}>
                                {done ? '✓' : step}
                            </div>
                            <p className={`text-sm ${done ? 'text-teal-600 dark:text-teal-300 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>{label}</p>
                        </div>
                    ))}
                </div>

                {/* Info */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                    <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        You will be notified via email once your account is approved. Keep an eye on your inbox.
                    </p>
                </div>

                <Link
                    to="/login"
                    className="block w-full text-center py-2.5 px-4 rounded-lg text-sm font-medium text-white
                        bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500
                        hover:scale-[1.02] transition-all duration-200"
                >
                    Back to Login
                </Link>
            </div>
        </AuthBackground>
    );
};

export default PendingApproval;
