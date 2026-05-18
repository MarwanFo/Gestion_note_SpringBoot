import React, { useState, useEffect } from 'react';
import { Plus, Search, User, Edit, Trash2, X, Save, RefreshCw, Copy } from 'lucide-react';
import api from '../../api/axios';

const ProfesseursList = () => {
    const [professeurs, setProfesseurs] = useState([]);
    const [filieres, setFilieres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({ 
        matricule: '', 
        nom: '', 
        prenom: '', 
        grade: '', 
        filiere: { id: '' } 
    });

    useEffect(() => {
        fetchProfesseurs();
        fetchFilieres();
    }, []);

    const fetchProfesseurs = async () => {
        try {
            const response = await api.get('/professeurs');
            setProfesseurs(response.data);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilieres = async () => {
        try {
            const response = await api.get('/filieres');
            setFilieres(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Erreur filieres:', error);
            setFilieres([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'filiereId') {
            setFormData(prev => ({ ...prev, filiere: { id: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEdit = (prof) => {
        setFormData({ 
            matricule: prof.matricule, 
            nom: prof.nom, 
            prenom: prof.prenom, 
            grade: prof.grade, 
            filiere: { id: prof.filiere?.id || '' } 
        });
        setSelectedId(prof.id);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let response;
            if (isEditing) {
                await api.put(`/professeurs/${selectedId}`, formData);
            } else {
                response = await api.post('/professeurs', formData);
            }
            setIsModalOpen(false);
            
            if (!isEditing && response?.data?.generatedPassword) {
                const email = formData.nom.toLowerCase() + "." + formData.prenom.toLowerCase() + "@school.com";
                const username = "prof_" + formData.matricule.toLowerCase();
                
                const credsText = `Email: ${email}\nLogin: ${username}\nMot de passe: ${response.data.generatedPassword}`;
                
                // Show a nice alert and copy to clipboard
                navigator.clipboard.writeText(credsText).catch(() => {});
                alert(`✅ COMPTE CRÉÉ AVEC SUCCÈS !\n\n${credsText}\n\n(Ces informations ont été copiées dans votre presse-papier)`);
            }
            
            setFormData({ matricule: '', nom: '', prenom: '', grade: '', filiere: { id: '' } });
            setIsEditing(false);
            setSelectedId(null);
            fetchProfesseurs();
        } catch (error) {
            alert("Erreur lors de l'enregistrement.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Voulez-vous vraiment supprimer ce professeur ?")) {
            try {
                await api.delete(`/professeurs/${id}`);
                fetchProfesseurs();
            } catch (error) {
                alert("Erreur lors de la suppression.");
            }
        }
    };

    const handleResetPassword = async (id, nom, prenom) => {
        if (window.confirm(`Générer un nouveau mot de passe pour le Pr. ${nom} ${prenom} ?`)) {
            try {
                const response = await api.post(`/professeurs/${id}/reset-password`);
                const newPass = response.data.newPassword;
                navigator.clipboard.writeText(`Nouveau mot de passe: ${newPass}`).catch(() => {});
                alert(`✅ MOT DE PASSE RÉINITIALISÉ !\n\nNouveau mot de passe: ${newPass}\n\n(Copié dans le presse-papier)`);
            } catch (error) {
                alert("Erreur: Le professeur n'a pas de compte utilisateur lié.");
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Gestion des Professeurs</h1>
                    <p className="text-slate-500 font-medium">Consultez et gérez le corps professoral.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Ajouter un professeur
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" placeholder="Rechercher..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Professeur</th>
                                <th className="px-6 py-4">Matricule</th>
                                <th className="px-6 py-4">Filière</th>
                                <th className="px-6 py-4">Grade</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">Chargement...</td></tr>
                            ) : professeurs.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">Aucun professeur trouvé.</td></tr>
                            ) : (
                                professeurs.map((prof) => (
                                    <tr key={prof.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <p className="font-bold text-slate-900">{prof.nom} {prof.prenom}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{prof.matricule}</td>
                                        <td className="px-6 py-4">{prof.filiere ? prof.filiere.code : '-'}</td>
                                        <td className="px-6 py-4">{prof.grade || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleResetPassword(prof.id, prof.nom, prof.prenom)}
                                                    title="Réinitialiser le mot de passe"
                                                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleEdit(prof)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(prof.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Modifier le professeur' : 'Nouveau Professeur'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Matricule *</label>
                                <input type="text" name="matricule" required value={formData.matricule} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4" placeholder="Ex: P12345" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Nom *</label>
                                    <input type="text" name="nom" required value={formData.nom} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Prénom *</label>
                                    <input type="text" name="prenom" required value={formData.prenom} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Grade</label>
                                    <input type="text" name="grade" value={formData.grade} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4" placeholder="Ex: PES" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Filière</label>
                                    <select name="filiereId" value={formData.filiere.id} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-700">
                                        <option value="">-- Choisir --</option>
                                        {Array.isArray(filieres) && filieres.map(f => (
                                            <option key={f.id} value={f.id}>{f.code}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl">Annuler</button>
                                <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2">
                                    {isSubmitting ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Enregistrer')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfesseursList;
