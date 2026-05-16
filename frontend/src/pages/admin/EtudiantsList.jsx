import React, { useState, useEffect } from 'react';
import { Plus, Search, User, Edit, Trash2, X, Save, Key, AlertTriangle, Copy, Check } from 'lucide-react';
import api from '../../api/axios';

const EtudiantsList = () => {
    const [etudiants, setEtudiants] = useState([]);
    const [filieres, setFilieres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({ 
        cne: '', 
        nom: '', 
        prenom: '', 
        telephone: '', 
        filiere: { id: '' },
        dateNaissance: '',
        adresse: '',
        email: ''
    });

    useEffect(() => {
        fetchEtudiants();
        fetchFilieres();
    }, []);

    const fetchEtudiants = async () => {
        try {
            const response = await api.get('/etudiants');
            setEtudiants(response.data);
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

    const handleEdit = (etudiant) => {
        setFormData({ 
            cne: etudiant.cne, 
            nom: etudiant.nom, 
            prenom: etudiant.prenom, 
            telephone: etudiant.telephone, 
            dateNaissance: etudiant.dateNaissance || '',
            adresse: etudiant.adresse || '',
            email: etudiant.email || '',
            filiere: { id: etudiant.filiere?.id || '' } 
        });
        setSelectedId(etudiant.id);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const [successModal, setSuccessModal] = useState({ isOpen: false, username: '', password: '', title: '' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });
    const [copiedField, setCopiedField] = useState(null);

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (isEditing) {
                await api.put(`/etudiants/${selectedId}`, formData);
                setIsModalOpen(false);
                setFormData({ cne: '', nom: '', prenom: '', telephone: '', dateNaissance: '', adresse: '', email: '', filiere: { id: '' } });
                setIsEditing(false);
                setSelectedId(null);
                fetchEtudiants();
            } else {
                const response = await api.post('/etudiants', formData);
                setIsModalOpen(false);
                setSuccessModal({
                    isOpen: true,
                    username: response.data.user?.username || response.data.email,
                    password: response.data.generatedPassword,
                    title: 'Compte Créé !'
                });
                setFormData({ cne: '', nom: '', prenom: '', telephone: '', dateNaissance: '', adresse: '', email: '', filiere: { id: '' } });
                fetchEtudiants();
            }
        } catch (error) {
            if (error.response && error.response.data && typeof error.response.data === 'string') {
                alert(error.response.data);
            } else {
                alert("Erreur lors de l'enregistrement. Veuillez vérifier les informations.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const promptDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: "Supprimer l'étudiant",
            message: "Voulez-vous vraiment supprimer cet étudiant ? Cette action est irréversible.",
            isDestructive: true,
            onConfirm: () => handleDelete(id)
        });
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/etudiants/${id}`);
            fetchEtudiants();
            setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });
        } catch (error) {
            alert("Erreur lors de la suppression.");
            setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });
        }
    };

    const promptResetPassword = (id) => {
        setConfirmModal({
            isOpen: true,
            title: "Réinitialiser le mot de passe",
            message: "Voulez-vous générer un nouveau mot de passe pour cet étudiant ? L'ancien mot de passe sera écrasé et définitivement perdu.",
            isDestructive: false,
            onConfirm: () => handleResetPassword(id)
        });
    };

    const handleResetPassword = async (id) => {
        try {
            const response = await api.post(`/etudiants/${id}/reset-password`);
            setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });
            setSuccessModal({
                isOpen: true,
                username: response.data.user?.username || response.data.email,
                password: response.data.generatedPassword,
                title: 'Mot de passe réinitialisé !'
            });
        } catch (error) {
            setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });
            if (error.response && error.response.data && typeof error.response.data === 'string') {
                alert(error.response.data);
            } else {
                alert("Erreur lors de la réinitialisation du mot de passe.");
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Gestion des Étudiants</h1>
                    <p className="text-slate-500 font-medium">Consultez et gérez les étudiants inscrits.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Ajouter un étudiant
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher par nom, CNE..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Étudiant</th>
                                <th className="px-6 py-4">CNE</th>
                                <th className="px-6 py-4">Filière</th>
                                <th className="px-6 py-4">Téléphone</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">Chargement...</td>
                                </tr>
                            ) : etudiants.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">Aucun étudiant trouvé.</td>
                                </tr>
                            ) : (
                                etudiants.map((etudiant) => (
                                    <tr key={etudiant.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{etudiant.nom} {etudiant.prenom}</p>
                                                    <p className="text-xs text-slate-500">{etudiant.email || etudiant.user?.email || "Pas d'email"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{etudiant.cne}</td>
                                        <td className="px-6 py-4">
                                            {etudiant.filiere ? (
                                                <span className="inline-flex px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs">
                                                    {etudiant.filiere.code}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4">{etudiant.telephone || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => promptResetPassword(etudiant.id)}
                                                    title="Réinitialiser le mot de passe"
                                                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                >
                                                    <Key className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleEdit(etudiant)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => promptDelete(etudiant.id)}
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

            {/* Success Password Modal */}
            {successModal.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 text-center p-8">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Save className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">{successModal.title || 'Succès'}</h2>
                        <p className="text-slate-500 text-sm mb-6">L'étudiant peut maintenant se connecter avec ces identifiants sécurisés.</p>
                        
                        <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 text-left space-y-3">
                            <div className="flex justify-between items-center gap-4">
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Email / Utilisateur</p>
                                    <p className="font-mono text-slate-900 font-bold select-all truncate">{successModal.username}</p>
                                </div>
                                <button 
                                    onClick={() => handleCopy(successModal.username, 'username')} 
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 bg-white rounded-xl border border-slate-200 shadow-sm transition-all"
                                    title="Copier l'utilisateur"
                                >
                                    {copiedField === 'username' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                            <div className="h-px bg-slate-200" />
                            <div className="flex justify-between items-center gap-4">
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Mot de passe</p>
                                    <p className="font-mono text-blue-600 font-black text-lg select-all tracking-wider truncate">{successModal.password}</p>
                                </div>
                                <button 
                                    onClick={() => handleCopy(successModal.password, 'password')} 
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 bg-white rounded-xl border border-slate-200 shadow-sm transition-all"
                                    title="Copier le mot de passe"
                                >
                                    {copiedField === 'password' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button 
                            onClick={() => setSuccessModal({ isOpen: false, username: '', password: '', title: '' })}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
                        >
                            C'est noté !
                        </button>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Modifier l\'étudiant' : 'Nouvel Étudiant'}</h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {!isEditing && (
                                <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-xl text-sm font-medium">
                                    💡 Un compte sécurisé sera généré. Le <strong>Mail</strong> servira de nom d'utilisateur.
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Nom *</label>
                                    <input 
                                        type="text" name="nom" required
                                        value={formData.nom} onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                                        placeholder="Ex: Alaoui"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Prénom *</label>
                                    <input 
                                        type="text" name="prenom" required
                                        value={formData.prenom} onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                                        placeholder="Ex: Ahmed"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">CNE *</label>
                                    <input 
                                        type="text" name="cne" required
                                        value={formData.cne} onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                                        placeholder="Ex: R123456789"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Filière</label>
                                    <select name="filiereId" value={formData.filiere.id} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-700">
                                        <option value="">-- Choisir --</option>
                                        {Array.isArray(filieres) && filieres.map(f => (
                                            <option key={f.id} value={f.id}>{f.code}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Téléphone</label>
                                    <input 
                                        type="tel" name="telephone"
                                        value={formData.telephone} onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                                        placeholder="Ex: 06..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Date Naissance</label>
                                    <input 
                                        type="date" name="dateNaissance"
                                        value={formData.dateNaissance} onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Email *</label>
                                    <input 
                                        type="email" name="email" required
                                        value={formData.email} onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                                        placeholder="Ex: test@school.com"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Adresse</label>
                                    <input 
                                        type="text" name="adresse"
                                        value={formData.adresse} onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                                        placeholder="Ex: 123 Rue de..."
                                    />
                                </div>
                            </div>

                            <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                                >
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

export default EtudiantsList;
