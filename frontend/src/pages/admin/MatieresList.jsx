import React, { useState, useEffect } from 'react';
import { Plus, Search, Book, Edit, Trash2, X, Save, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';

const MatieresList = () => {
    const [matieres, setMatieres] = useState([]);
    const [filieres, setFilieres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({ 
        code: '', 
        libelle: '', 
        coefficient: '', 
        nbrHeures: '', 
        filiere: { id: '' } 
    });
    
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });

    useEffect(() => {
        fetchMatieres();
        fetchFilieres();
    }, []);

    const fetchMatieres = async () => {
        try {
            const response = await api.get('/matieres');
            setMatieres(response.data);
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

    const handleEdit = (matiere) => {
        setFormData({ 
            code: matiere.code, 
            libelle: matiere.libelle, 
            coefficient: matiere.coefficient, 
            nbrHeures: matiere.nbrHeures, 
            filiere: { id: matiere.filiere?.id || '' } 
        });
        setSelectedId(matiere.id);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (isEditing) {
                await api.put(`/matieres/${selectedId}`, formData);
            } else {
                await api.post('/matieres', formData);
            }
            setIsModalOpen(false);
            setFormData({ code: '', libelle: '', coefficient: '', nbrHeures: '', filiere: { id: '' } });
            setIsEditing(false);
            setSelectedId(null);
            fetchMatieres();
        } catch (error) {
            alert("Erreur lors de l'enregistrement.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const promptDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: "Supprimer la matière",
            message: "Voulez-vous vraiment supprimer cette matière ?",
            isDestructive: true,
            onConfirm: () => handleDelete(id)
        });
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/matieres/${id}`);
            fetchMatieres();
            setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });
        } catch (error) {
            alert("Erreur lors de la suppression.");
            setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Gestion des Matières</h1>
                    <p className="text-slate-500 font-medium">Consultez et gérez les cours et leurs coefficients.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-green-600/20 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Ajouter une matière
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" placeholder="Rechercher une matière..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Matière</th>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Filière</th>
                                <th className="px-6 py-4">Coefficient</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">Chargement...</td></tr>
                            ) : matieres.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">Aucune matière trouvée.</td></tr>
                            ) : (
                                matieres.map((matiere) => (
                                    <tr key={matiere.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                    <Book className="w-5 h-5" />
                                                </div>
                                                <p className="font-bold text-slate-900">{matiere.libelle}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{matiere.code}</td>
                                        <td className="px-6 py-4 font-medium">{matiere.filiere ? matiere.filiere.code : '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                                                Coef: {matiere.coefficient || 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEdit(matiere)} className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                                                <button 
                                                    onClick={() => promptDelete(matiere.id)}
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
                            <h3 className="text-xl font-bold text-slate-900">{isEditing ? 'Modifier la matière' : 'Nouvelle matière'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Code de la matière *</label>
                                <input type="text" name="code" required value={formData.code} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4" placeholder="Ex: INFO101" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Libellé (Nom) *</label>
                                <input type="text" name="libelle" required value={formData.libelle} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4" placeholder="Ex: Algorithmique" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Coefficient</label>
                                    <input type="number" name="coefficient" min="1" max="10" value={formData.coefficient} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4" />
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
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all">Annuler</button>
                                <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-green-600/20 flex items-center gap-2">
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            {isEditing ? 'Mettre à jour' : 'Enregistrer'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Confirm Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-center p-8">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmModal.isDestructive ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-extrabold text-slate-900 mb-2">{confirmModal.title}</h2>
                        <p className="text-slate-500 text-sm mb-8">{confirmModal.message}</p>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false })}
                                className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={confirmModal.onConfirm}
                                className={`flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${confirmModal.isDestructive ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'}`}
                            >
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MatieresList;
