import React, { useState, useEffect } from 'react';
import { Users, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const MesClasses = () => {
    const [matieres, setMatieres] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                // In a real app, we would fetch only matieres assigned to this prof
                const response = await api.get('/matieres');
                setMatieres(response.data);
            } catch (error) {
                console.error('Erreur:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-400 font-bold">Chargement de vos classes...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Mes Classes</h1>
                <p className="text-slate-500 font-medium">Consultez la liste des matières que vous enseignez.</p>
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
