import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LogIn, User, Lock, GraduationCap, ChevronRight } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/login', { username, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
            navigate('/dashboard');
        } catch (err) {
            setError('Identifiants invalides. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] p-4 font-['Outfit']">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-100 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
            </div>

            <div className="max-w-[440px] w-full bg-white/80 backdrop-blur-2xl p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white">
                <div className="flex flex-col items-center mb-8 sm:mb-10">
                    <div className="bg-blue-600 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-xl shadow-blue-600/30 rotate-3">
                        <GraduationCap className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Gestion Notes</h1>
                    <p className="text-slate-500 mt-2 font-medium text-sm sm:text-base text-center">Portail de gestion académique</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Email / Utilisateur</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-blue-600 text-slate-400">
                                <User className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600/20 transition-all"
                                placeholder="Email ou Nom d'utilisateur"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Mot de passe</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-blue-600 text-slate-400">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600/20 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-xl border border-red-100 flex items-center gap-2 animate-shake">
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 group active:scale-[0.98]"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Se connecter</span>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col items-center">
                    <p className="text-slate-400 text-[0.7rem] uppercase tracking-[0.2em] font-bold">
                        Système de Management Scolaire
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
