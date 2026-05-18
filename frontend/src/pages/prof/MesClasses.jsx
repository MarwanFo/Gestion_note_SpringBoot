import React, { useState, useEffect } from 'react';
import { Users, BookOpen, GraduationCap, ArrowRight, User, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const MesClasses = () => {
    const [matieres, setMatieres] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Profile
                const profileRes = await api.get('/professeurs/me');
                setProfile(profileRes.data);

                // Fetch classes
                const response = await api.get('/matieres');
                setMatieres(response.data);
            } catch (error) {
                console.error('Erreur:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-400 font-bold">Chargement de vos classes...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Premium Header / Profile Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold">{profile?.nom} {profile?.prenom}</h1>
                            <p className="text-indigo-100 font-medium mt-1">Matricule: {profile?.matricule} &bull; Grade: {profile?.grade || 'Professeur'}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
                        <div className="bg-white/20 p-3 rounded-xl">
                            <BookOpen className="w-6 h-6 text-indigo-100" />
                        </div>
                        <div>
                            <p className="text-indigo-100 text-sm font-semibold uppercase tracking-wider">Classes Assignées</p>
                            <p className="text-3xl font-black">{matieres.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 mb-4">
                <h2 className="text-2xl font-extrabold text-slate-900">Mes Classes</h2>
                <p className="text-slate-500 font-medium">Sélectionnez une classe pour gérer les évaluations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matieres.length === 0 ? (
                    <div className="col-span-full p-12 bg-white rounded-3xl border border-dashed border-slate-200 text-center text-slate-400">
                        Aucune classe assignée pour le moment.
                    </div>
                ) : (
                    matieres.map((matiere) => (
                        <div key={matiere.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
                            <div className="p-6 bg-gradient-to-br from-slate-50 to-white">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
                                        {matiere.filiere?.code || 'Général'}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                    {matiere.libelle}
                                </h3>
                                <p className="text-slate-500 text-sm mt-1">Coeff: {matiere.coefficient} • {matiere.nbrHeures}h annuelles</p>
                            </div>
                            
                            <div className="p-6 pt-0 space-y-4">
                                <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                    <Users className="w-4 h-4 text-slate-400" />
                                    <span>Liste des étudiants prête</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                    <GraduationCap className="w-4 h-4 text-slate-400" />
                                    <span>Filière: {matiere.filiere?.libelle}</span>
                                </div>
                                
                                <Link 
                                    to="/dashboard/saisie-notes" 
                                    className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white py-3 rounded-2xl font-bold transition-all shadow-lg shadow-slate-900/10"
                                >
                                    Gérer les notes <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MesClasses;
