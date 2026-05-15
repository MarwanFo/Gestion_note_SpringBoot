import React, { useEffect, useState } from 'react';
import { Users, GraduationCap, BookOpen, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const StatCard = ({ title, value, icon: Icon, color, link }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group">
        <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${color}-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>
        <div className="relative flex justify-between items-start">
            <div>
                <p className="text-slate-500 font-medium text-sm mb-1">{title}</p>
                <h3 className="text-3xl font-extrabold text-slate-900">{value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-${color}-50 flex items-center justify-center`}>
                <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
        </div>
        <Link to={link} className={`mt-6 inline-flex items-center gap-2 text-sm font-bold text-${color}-600 hover:text-${color}-700`}>
            Gérer <ArrowRight className="w-4 h-4" />
        </Link>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({ etudiants: 0, professeurs: 0, matieres: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [etRes, prRes, maRes] = await Promise.all([
                    api.get('/etudiants'),
                    api.get('/professeurs'),
                    api.get('/matieres')
                ]);
                setStats({
                    etudiants: etRes.data.length,
                    professeurs: prRes.data.length,
                    matieres: maRes.data.length
                });
            } catch (error) {
                console.error("Error fetching dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Vue d'ensemble</h1>
                <p className="text-slate-500 font-medium mt-1">Statistiques et raccourcis de l'administration.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Étudiants" 
                    value={loading ? "..." : stats.etudiants} 
                    icon={Users} 
                    color="blue" 
                    link="/dashboard/etudiants" 
                />
                <StatCard 
                    title="Professeurs" 
                    value={loading ? "..." : stats.professeurs} 
                    icon={GraduationCap} 
                    color="indigo" 
                    link="/dashboard/professeurs" 
                />
                <StatCard 
                    title="Matières" 
                    value={loading ? "..." : stats.matieres} 
                    icon={BookOpen} 
                    color="green" 
                    link="/dashboard/matieres" 
                />
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Activité récente</h2>
                    <button className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl font-bold text-sm transition-colors">
                        Tout voir
                    </button>
                </div>
                <div className="space-y-4">
                    {/* Placeholder for activity list */}
                    <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-900 font-bold text-sm">Nouvel étudiant ajouté</p>
                            <p className="text-slate-500 text-xs mt-0.5">Il y a 2 heures</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-900 font-bold text-sm">Moyennes calculées (Semestre 1)</p>
                            <p className="text-slate-500 text-xs mt-0.5">Hier à 14:30</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
