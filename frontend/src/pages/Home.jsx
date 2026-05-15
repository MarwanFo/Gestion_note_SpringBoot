import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Users, BarChart3, ChevronRight, CheckCircle2, Menu, X } from 'lucide-react';

const Home = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white font-['Outfit'] overflow-x-hidden">
            {/* Navigation */}
            <nav className="relative z-50 bg-white/80 backdrop-blur-md border-b border-slate-50 sticky top-0">
                <div className="flex items-center justify-between px-6 sm:px-8 py-4 max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20">
                            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Gestion Notes</span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/login" className="text-slate-600 hover:text-blue-600 font-semibold transition-colors">
                            Se connecter
                        </Link>
                        <Link to="/login" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-slate-900/10">
                            Espace Étudiant
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button 
                        className="md:hidden p-2 text-slate-600"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-2">
                        <Link to="/login" className="text-slate-600 font-semibold py-2">Se connecter</Link>
                        <Link to="/login" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-center">
                            Espace Étudiant
                        </Link>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <header className="px-6 sm:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                <div className="flex-1 text-center lg:text-left space-y-6 sm:space-y-8">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs sm:text-sm font-bold border border-blue-100">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Système 2026 opérationnel</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                        Gérez vos notes avec <span className="text-blue-600">précision</span>.
                    </h1>
                    <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                        Plateforme moderne pour étudiants et professeurs. Suivez vos performances et 
                        consultez vos bulletins en un seul endroit.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                        <Link to="/login" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 group">
                            Commencer
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                            En savoir plus
                        </button>
                    </div>
                </div>

                <div className="flex-1 w-full max-w-lg lg:max-w-none">
                    <div className="relative bg-slate-50 rounded-[2.5rem] sm:rounded-[3rem] p-3 sm:p-4 border border-slate-100 shadow-2xl overflow-hidden">
                        <img 
                            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800" 
                            alt="Student" 
                            className="rounded-[2rem] sm:rounded-[2.5rem] object-cover w-full h-[300px] sm:h-[400px] shadow-inner"
                        />
                        <div className="absolute top-6 right-6 sm:top-8 sm:right-8 bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl border border-white flex items-center gap-3">
                            <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg">
                                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-[0.5rem] sm:text-[0.6rem] uppercase tracking-wider font-bold text-slate-400">Moyenne</p>
                                <p className="text-base sm:text-lg font-bold text-slate-900">16.45 / 20</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features */}
            <section className="bg-slate-50 py-16 sm:py-24 px-6 sm:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            { icon: BookOpen, title: "Suivi des Cours", color: "blue", desc: "Accédez à vos matières et coefficients en temps réel." },
                            { icon: Users, title: "Espace Enseignant", color: "indigo", desc: "Les professeurs peuvent saisir les notes en toute sécurité." },
                            { icon: BarChart3, title: "Bulletins PDF", color: "green", desc: "Générez vos relevés de notes officiels en un clic." }
                        ].map((f, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                                <div className={`bg-${f.color}-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6`}>
                                    <f.icon className={`w-6 h-6 text-${f.color}-600`} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="py-12 text-center border-t border-slate-100">
                <p className="text-slate-400 text-sm font-medium">© 2026 Gestion Notes</p>
            </footer>
        </div>
    );
};

export default Home;
