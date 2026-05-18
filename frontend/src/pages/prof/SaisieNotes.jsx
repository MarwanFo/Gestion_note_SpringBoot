import React, { useState, useEffect } from 'react';
import { Save, BookOpen, User, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

const SaisieNotes = () => {
    const [matieres, setMatieres] = useState([]);
    const [selectedMatiere, setSelectedMatiere] = useState(null);
    const [students, setStudents] = useState([]);
    const [notes, setNotes] = useState({}); // { studentId: { value, observation } }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchMatieres();
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

    const handleMatiereChange = async (e) => {
        const matiereId = e.target.value;
        if (!matiereId) {
            setSelectedMatiere(null);
            setStudents([]);
            return;
        }

        const matiere = matieres.find(m => m.id === parseInt(matiereId));
        setSelectedMatiere(matiere);
        setLoading(true);

        try {
            // Fetch students in this filiere
            const studentsRes = await api.get(`/etudiants/filiere/${matiere.filiere.id}`);
            setStudents(studentsRes.data);

            // Fetch existing notes for this matiere
            const notesRes = await api.get(`/notes/matiere/${matiere.id}`);
            const notesMap = {};
            notesRes.data.forEach(note => {
                notesMap[note.etudiant.id] = {
                    cc1: note.cc1 !== null && note.cc1 !== undefined ? note.cc1 : '',
                    cc2: note.cc2 !== null && note.cc2 !== undefined ? note.cc2 : '',
                    examen: note.examen !== null && note.examen !== undefined ? note.examen : '',
                    rattrapage: note.rattrapage !== null && note.rattrapage !== undefined ? note.rattrapage : '',
                    observation: note.observation || ''
                };
            });
            setNotes(notesMap);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };
 
    const handleNoteChange = (studentId, field, value) => {
        setNotes(prev => ({
            ...prev,
            [studentId]: {
                ...(prev[studentId] || { cc1: '', cc2: '', examen: '', rattrapage: '', observation: '' }),
                [field]: value
            }
        }));
    };
 
    const handleSaveNote = async (studentId) => {
        const noteData = notes[studentId];
        if (!noteData) return;
 
        setSaving(true);
        try {
            const payload = {
                cc1: noteData.cc1 !== '' ? parseFloat(noteData.cc1) : null,
                cc2: noteData.cc2 !== '' ? parseFloat(noteData.cc2) : null,
                examen: noteData.examen !== '' ? parseFloat(noteData.examen) : null,
                rattrapage: noteData.rattrapage !== '' ? parseFloat(noteData.rattrapage) : null,
                observation: noteData.observation,
                etudiant: { id: studentId },
                matiere: { id: selectedMatiere.id }
            };
            await api.post('/notes', payload);
            setMessage({ type: 'success', text: 'Note enregistrée !' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading && matieres.length === 0) {
        return <div className="flex items-center justify-center h-64 text-slate-400">Chargement...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Saisie des Notes</h1>
                    <p className="text-slate-500 font-medium">Sélectionnez une matière pour commencer l'évaluation.</p>
                </div>
                {message && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold animate-in zoom-in-95 ${
                        message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                        {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {message.text}
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="max-w-md space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        Choisir une matière
                    </label>
                    <select 
                        onChange={handleMatiereChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    >
                        <option value="">-- Sélectionnez --</option>
                        {matieres.map(m => (
                            <option key={m.id} value={m.id}>{m.libelle} ({m.filiere?.code})</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedMatiere && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h2 className="font-bold text-slate-900">Liste des étudiants - {selectedMatiere.libelle}</h2>
                        <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-100 uppercase">
                            Filière: {selectedMatiere.filiere?.code}
                        </span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Étudiant</th>
                                    <th className="px-4 py-4 w-24 text-center">CC 1 (/20)</th>
                                    <th className="px-4 py-4 w-24 text-center">CC 2 (/20)</th>
                                    <th className="px-4 py-4 w-24 text-center">Examen (/20)</th>
                                    <th className="px-4 py-4 w-28 text-center">Moy. Initiale</th>
                                    <th className="px-4 py-4 w-24 text-center">Rattrapage</th>
                                    <th className="px-4 py-4 w-28 text-center">Moy. Finale</th>
                                    <th className="px-6 py-4">Observation</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.length === 0 ? (
                                    <tr><td colSpan="9" className="px-6 py-8 text-center text-slate-400">Aucun étudiant dans cette filière.</td></tr>
                                ) : (
                                    students.map(student => {
                                        const note = notes[student.id] || { cc1: '', cc2: '', examen: '', rattrapage: '', observation: '' };
                                        
                                        const nCc1 = parseFloat(note.cc1);
                                        const nCc2 = parseFloat(note.cc2);
                                        const nExamen = parseFloat(note.examen);
                                        const nRattrapage = parseFloat(note.rattrapage);
                                        
                                        let ccAvg = 0;
                                        let ccCount = 0;
                                        if (!isNaN(nCc1)) { ccAvg += nCc1; ccCount++; }
                                        if (!isNaN(nCc2)) { ccAvg += nCc2; ccCount++; }
                                        ccAvg = ccCount > 0 ? (ccAvg / ccCount) : 0;
                                        
                                        const initialAverage = (ccAvg * 0.25) + ((isNaN(nExamen) ? 0 : nExamen) * 0.75);
                                        const isInitialReady = !isNaN(nCc1) && !isNaN(nCc2) && !isNaN(nExamen);
                                        const isRattrapageOpen = isInitialReady && initialAverage < 10.0;
                                        
                                        let finalAverage = initialAverage;
                                        if (isRattrapageOpen && !isNaN(nRattrapage)) {
                                            const rattAverage = (ccAvg * 0.25) + (nRattrapage * 0.75);
                                            finalAverage = Math.max(initialAverage, rattAverage);
                                        }

                                        return (
                                            <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                            <User className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{student.nom} {student.prenom}</p>
                                                            <p className="text-xs text-slate-500">{student.cne}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <input 
                                                        type="number" 
                                                        min="0" max="20" step="0.25"
                                                        value={note.cc1}
                                                        onChange={(e) => handleNoteChange(student.id, 'cc1', e.target.value)}
                                                        className="w-16 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-center font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <input 
                                                        type="number" 
                                                        min="0" max="20" step="0.25"
                                                        value={note.cc2}
                                                        onChange={(e) => handleNoteChange(student.id, 'cc2', e.target.value)}
                                                        className="w-16 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-center font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <input 
                                                        type="number" 
                                                        min="0" max="20" step="0.25"
                                                        value={note.examen}
                                                        onChange={(e) => handleNoteChange(student.id, 'examen', e.target.value)}
                                                        className="w-16 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-center font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    {isInitialReady ? (
                                                        <span className={`px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                                                            initialAverage >= 10.0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                                        }`}>
                                                            {initialAverage.toFixed(2)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 font-medium">Saisir notes</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <input 
                                                        type="number" 
                                                        min="0" max="20" step="0.25"
                                                        disabled={!isRattrapageOpen}
                                                        placeholder={isRattrapageOpen ? 'Ratt' : 'N/A'}
                                                        value={note.rattrapage}
                                                        onChange={(e) => handleNoteChange(student.id, 'rattrapage', e.target.value)}
                                                        className={`w-16 border rounded-lg py-1.5 px-2 text-center font-bold focus:outline-none ${
                                                            isRattrapageOpen 
                                                            ? 'bg-amber-50/50 border-amber-300 text-amber-700 focus:ring-2 focus:ring-amber-500/20' 
                                                            : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                                        }`}
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-center font-bold">
                                                    {isInitialReady ? (
                                                        <span className={`px-3 py-1.5 rounded-xl text-sm font-black ${
                                                            finalAverage >= 10.0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {finalAverage.toFixed(2)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input 
                                                        type="text" 
                                                        placeholder="R.A.S"
                                                        value={note.observation}
                                                        onChange={(e) => handleNoteChange(student.id, 'observation', e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => handleSaveNote(student.id)}
                                                        className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md shadow-blue-600/20 active:scale-95"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SaisieNotes;
