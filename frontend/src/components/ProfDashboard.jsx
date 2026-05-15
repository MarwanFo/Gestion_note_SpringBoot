import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const ProfDashboard = () => {
    const [stats, setStats] = useState({ matieres: 0, etudiants: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const matieresRes = await api.get('/matieres');
                const etudiantsRes = await api.get('/etudiants');
                setStats({
                    matieres: matieresRes.data.length,
                    etudiants: etudiantsRes.data.length
                });
            } catch (error) {
                console.error('Erreur stats:', error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold mb-2">Ravi de vous revoir ! 👋</h1>
                    <p className="text-blue-100 text-lg font-medium opacity-90">
                        C'est une excellente journée pour évaluer vos étudiants et suivre leurs progrès.
                    </p>
                </div>
                <Star className="absolute right-[-20px] top-[-20px] w-48 h-48 text-white/10 rotate-12" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <BookOpen className="w-7 h-7" />
                        </div>
                    </div>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Matières actives</p>
                    <h3 className="text-4xl font-black text-slate-900 mt-1">{stats.matieres}</h3>
                    <Link to="/dashboard/saisie-notes" className="mt-6 flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all">
                        Commencer la saisie <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                            <Users className="w-7 h-7" />
                        </div>
                    </div>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Étudiants à suivre</p>
                    <h3 className="text-4xl font-black text-slate-900 mt-1">{stats.etudiants}</h3>
                    <p className="mt-6 text-slate-400 font-medium italic">
                        "L'éducation est l'arme la plus puissante."
                    </p>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Actions rapides</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link to="/dashboard/saisie-notes" className="bg-white/10 hover:bg-white/20 p-6 rounded-2xl transition-colors border border-white/5">
                        <h4 className="font-bold mb-1">Saisir les notes</h4>
                        <p className="text-white/60 text-sm">Entrez les résultats du dernier examen.</p>
                    </Link>
                    <div className="bg-white/10 p-6 rounded-2xl border border-white/5 opacity-50 cursor-not-allowed">
                        <h4 className="font-bold mb-1">Consulter mes classes</h4>
                        <p className="text-white/60 text-sm">Aperçu de vos groupes (À venir).</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfDashboard;
