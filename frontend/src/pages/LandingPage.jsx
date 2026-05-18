import { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Building2, ShieldCheck, ArrowRight, UserPlus, LogIn, Search, Briefcase } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const timeoutRef = useRef(null);

    const resetTimer = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            navigate('/login');
        }, 3600000); // 1 hour
    };

    useEffect(() => {
        resetTimer();

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keydown', resetTimer);
        };
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0F1C2E] via-[#1E3A5F] to-[#0F1C2E] text-white font-sans selection:bg-teal-500 selection:text-white overflow-x-hidden">
            {/* Navbar */}
            <header className="absolute top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="p-2.5 bg-teal-500/20 border border-teal-500/40 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-teal-500/10">
                            <GraduationCap className="w-7 h-7 text-teal-400" />
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-teal-300 bg-clip-text text-transparent">
                            Stag.io
                        </span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link
                            to="/login"
                            className="flex items-center px-5 py-2.5 rounded-xl font-semibold text-sm text-gray-200 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all shadow-sm"
                        >
                            <LogIn className="w-4 h-4 mr-2 text-teal-400" /> Login
                        </Link>
                        <Link
                            to="/register"
                            className="flex items-center px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 hover:scale-105 transition-all border border-teal-400/30"
                        >
                            <UserPlus className="w-4 h-4 mr-2" /> Register
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-36 pb-24 md:pt-48 md:pb-32 px-6 flex flex-col items-center justify-center text-center overflow-hidden min-h-screen flex items-center">
                {/* Background glow circles */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-4xl mx-auto z-10 space-y-8 animate-fade-in-up">
                    {/* Badge */}
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-inner mb-2">
                        <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse mr-2" />
                        <span className="text-xs font-bold tracking-wider text-teal-300 uppercase">100% Algérien & Officiel</span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight flex flex-col sm:flex-row items-center justify-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-teal-500/30 rounded-3xl shadow-2xl shadow-teal-500/10 animate-bounce">
                            <GraduationCap className="w-16 h-16 text-teal-400" />
                        </div>
                        <span className="bg-gradient-to-r from-white via-gray-100 to-teal-200 bg-clip-text text-transparent drop-shadow-sm">
                            Stag.io
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl sm:text-2xl text-gray-300 font-normal max-w-2xl mx-auto leading-relaxed">
                        La plateforme algérienne de gestion des stages. Connectez les talents académiques aux opportunités des entreprises.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
                        <Link
                            to="/register"
                            className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-xl font-bold text-base text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 shadow-xl shadow-teal-500/20 hover:shadow-teal-500/30 hover:scale-105 transition-all border border-teal-400/30 group"
                        >
                            <Search className="w-5 h-5 mr-2 text-teal-100 group-hover:rotate-12 transition-transform" /> 
                            Trouver un stage
                            <ArrowRight className="w-5 h-5 ml-2 opacity-80 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/register"
                            className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-xl font-bold text-base text-gray-200 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 backdrop-blur-md shadow-xl hover:scale-105 transition-all group"
                        >
                            <Briefcase className="w-5 h-5 mr-2 text-blue-400 group-hover:scale-110 transition-transform" />
                            Publier une offre
                            <ArrowRight className="w-5 h-5 ml-2 opacity-80 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Feature Cards Section */}
            <section className="relative py-24 px-6 border-t border-white/10 bg-[#0F1C2E]/60 backdrop-blur-3xl z-10">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                            Une solution complète pour chaque rôle
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-base">
                            Découvrez comment Stag.io simplifie et encadre l'ensemble du processus de stage en Algérie.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Students Card */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-teal-500/40 transition-all duration-300 group shadow-xl hover:shadow-teal-500/10 flex flex-col justify-between">
                            <div>
                                <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                                    <GraduationCap className="w-8 h-8 text-teal-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3 flex items-center">
                                    Étudiants
                                </h3>
                                <p className="text-gray-300 text-base leading-relaxed mb-6">
                                    Créez votre profil, parcourez les offres de PFE / PFA et stages d'été, postulez en un clic et suivez l'état de vos candidatures en temps réel.
                                </p>
                            </div>
                            <Link to="/register" className="text-teal-400 font-bold inline-flex items-center hover:text-teal-300 transition-colors group/link">
                                Rejoindre en tant qu'étudiant <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Companies Card */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-blue-500/40 transition-all duration-300 group shadow-xl hover:shadow-blue-500/10 flex flex-col justify-between">
                            <div>
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                                    <Building2 className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3 flex items-center">
                                    Entreprises
                                </h3>
                                <p className="text-gray-300 text-base leading-relaxed mb-6">
                                    Publiez facilement vos offres de stage, gérez les profils des candidats, organisez vos entretiens et validez les conventions directement en ligne.
                                </p>
                            </div>
                            <Link to="/register" className="text-blue-400 font-bold inline-flex items-center hover:text-blue-300 transition-colors group/link">
                                Rejoindre en tant qu'entreprise <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Admin Card */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-purple-500/40 transition-all duration-300 group shadow-xl hover:shadow-purple-500/10 flex flex-col justify-between">
                            <div>
                                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="w-8 h-8 text-purple-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3 flex items-center">
                                    Administration
                                </h3>
                                <p className="text-gray-300 text-base leading-relaxed mb-6">
                                    Approuvez les comptes des entreprises, supervisez les affectations, gérez les statistiques nationales et délivrez les conventions officielles de stage.
                                </p>
                            </div>
                            <Link to="/login" className="text-purple-400 font-bold inline-flex items-center hover:text-purple-300 transition-colors group/link">
                                Connexion Administration <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-8 px-6 bg-[#0F1C2E] text-center text-gray-500 text-sm">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p>© {new Date().getFullYear()} Stag.io — Tous droits réservés. Plateforme algérienne de gestion des stages.</p>
                    <div className="flex space-x-6 text-gray-400">
                        <Link to="/login" className="hover:text-white transition-colors">Connexion</Link>
                        <Link to="/register" className="hover:text-white transition-colors">Inscription</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
