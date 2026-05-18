import React, { useState, useEffect } from 'react';
import { BookOpen, Award, TrendingUp, User, Sparkles, Printer } from 'lucide-react';
import api from '../../api/axios';

const MesNotes = () => {
    const [notes, setNotes] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [roadmap, setRoadmap] = useState(null);
    const [roadmapLoading, setRoadmapLoading] = useState(true);

    useEffect(() => {
        fetchProfileAndNotes();
    }, []);

    const fetchProfileAndNotes = async () => {
        try {
            // Fetch Profile
            const profileRes = await api.get('/etudiants/me');
            const studentProfile = profileRes.data;
            setProfile(studentProfile);

            // Fetch Notes
            const notesRes = await api.get('/notes/mes-notes');
            const studentNotes = notesRes.data;

            // Fetch all Matieres to filter by student's filiere
            const matieresRes = await api.get('/matieres');
            const studentMatieres = matieresRes.data.filter(
                m => m.filiere && studentProfile.filiere && m.filiere.id === studentProfile.filiere.id
            );

            // Build note list: for each student's filiere subject, find if a saved note exists
            const combinedNotes = studentMatieres.map(matiere => {
                const foundNote = studentNotes.find(n => n.matiere && n.matiere.id === matiere.id);
                // A note is only considered "published/saisie" if at least one of its primary grades (cc1, cc2, or examen) is not null!
                const isActuallySaisie = foundNote && (
                    foundNote.cc1 !== null || 
                    foundNote.cc2 !== null || 
                    foundNote.examen !== null
                );
                
                if (isActuallySaisie) {
                    return { ...foundNote, isSaisie: true };
                } else {
                    return {
                        id: `empty-${matiere.id}`,
                        matiere: matiere,
                        cc1: null,
                        cc2: null,
                        examen: null,
                        rattrapage: null,
                        valeur: null,
                        observation: '',
                        isSaisie: false
                    };
                }
            });

            setNotes(combinedNotes);

            // Fetch AI Roadmap
            api.get('/notes/mes-notes/roadmap')
                .then(res => setRoadmap(res.data.roadmap))
                .catch(err => {
                    console.error('Erreur roadmap:', err);
                    setRoadmap("Le coach IA est momentanément indisponible.");
                })
                .finally(() => setRoadmapLoading(false));

        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            setLoading(false);
            setRoadmapLoading(false);
        } finally {
            setLoading(false);
        }
    };

    // Robust zero-dependency markdown parser
    const renderMarkdown = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, index) => {
            if (line.startsWith('### ')) return <h3 key={index} className="text-lg font-bold text-slate-800 mt-4 mb-2">{line.replace('### ', '')}</h3>;
            if (line.startsWith('## ')) return <h2 key={index} className="text-xl font-extrabold text-slate-900 mt-5 mb-3">{line.replace('## ', '')}</h2>;
            if (line.startsWith('# ')) return <h1 key={index} className="text-2xl font-black text-slate-900 mt-6 mb-4">{line.replace('# ', '')}</h1>;
            
            // Handle bold text formatting `**text**` safely
            let formattedLine = line;
            const parts = line.split(/(\*\*.*?\*\*)/g);
            
            return (
                <p key={index} className={`text-slate-600 leading-relaxed ${line.startsWith('- ') || line.startsWith('* ') ? 'ml-4 flex gap-2' : 'mb-2'}`}>
                    {line.startsWith('- ') || line.startsWith('* ') ? <span className="text-indigo-400 mt-1">•</span> : null}
                    <span>
                        {parts.map((part, i) => 
                            part.startsWith('**') && part.endsWith('**') 
                                ? <strong key={i} className="font-bold text-slate-800">{part.slice(2, -2)}</strong> 
                                : part.replace(/^[-*]\s/, '') // remove bullet syntax from start
                        )}
                    </span>
                </p>
            );
        });
    };

    // Calculate Average only for saved grades
    const savedNotes = notes.filter(n => n.isSaisie && n.valeur !== null);
    const moyenne = savedNotes.length > 0 
        ? (savedNotes.reduce((acc, curr) => acc + curr.valeur, 0) / savedNotes.length).toFixed(2)
        : '0.00';

    const handlePrintBulletin = () => {
        const printWindow = window.open('', '_blank');
        
        // Calculate validation status for each subject
        const subjectsHtml = notes.map(note => {
            const hasCc1 = note.cc1 !== null;
            const hasCc2 = note.cc2 !== null;
            const hasExam = note.examen !== null;
            const hasRatt = note.rattrapage !== null;
            
            const isValide = note.isSaisie && note.valeur >= 10;
            const statusLabel = note.isSaisie 
                ? (isValide ? '<span style="color: #16a34a; font-weight: bold;">Validé</span>' : '<span style="color: #dc2626; font-weight: bold;">Non Validé</span>')
                : '<span style="color: #64748b; font-style: italic;">Non encore saisie</span>';
                
            return `
                <tr>
                    <td style="padding: 12px 10px; border: 1px solid #e2e8f0; font-size: 13px;">
                        <strong>${note.matiere?.libelle}</strong><br>
                        <small style="color: #64748b; font-weight: 500;">${note.matiere?.code}</small>
                    </td>
                    <td align="center" style="padding: 12px 10px; border: 1px solid #e2e8f0; font-size: 13px;">${note.isSaisie && hasCc1 ? note.cc1.toFixed(2) : '-'}</td>
                    <td align="center" style="padding: 12px 10px; border: 1px solid #e2e8f0; font-size: 13px;">${note.isSaisie && hasCc2 ? note.cc2.toFixed(2) : '-'}</td>
                    <td align="center" style="padding: 12px 10px; border: 1px solid #e2e8f0; font-size: 13px;">${note.isSaisie && hasExam ? note.examen.toFixed(2) : '-'}</td>
                    <td align="center" style="padding: 12px 10px; border: 1px solid #e2e8f0; font-size: 13px;">${note.isSaisie && hasRatt ? note.rattrapage.toFixed(2) : '-'}</td>
                    <td align="center" style="padding: 12px 10px; border: 1px solid #e2e8f0; font-weight: bold; font-size: 1.1em; color: #1e3a8a;">${note.isSaisie && note.valeur !== null ? note.valeur.toFixed(2) : '-'}</td>
                    <td align="center" style="padding: 12px 10px; border: 1px solid #e2e8f0; font-size: 13px;">${statusLabel}</td>
                </tr>
            `;
        }).join('');

        const isAdmis = parseFloat(moyenne) >= 10;
        const totalMatieres = notes.length;
        const totalSaisie = savedNotes.length;
        const globalStatus = totalSaisie < totalMatieres 
            ? '<span style="color: #d97706; font-weight: bold;">Résultats Incomplets</span>'
            : (isAdmis ? '<span style="color: #16a34a; font-weight: bold;">ADMIS (VALIDÉ)</span>' : '<span style="color: #dc2626; font-weight: bold;">NON ADMIS (AJOURNÉ)</span>');

        const currentDate = new Date().toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        printWindow.document.write(`
            <html>
                <head>
                    <title>Bulletin de Notes - ${profile?.nom} ${profile?.prenom}</title>
                    <style>
                        body {
                            font-family: 'Inter', system-ui, sans-serif;
                            color: #1e293b;
                            margin: 0;
                            padding: 40px;
                            line-height: 1.5;
                        }
                        .header-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 40px;
                        }
                        .header-title {
                            text-align: center;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            margin-top: 0;
                            color: #1e3a8a;
                            font-size: 24px;
                            font-weight: 800;
                            border-bottom: 3px double #1e3a8a;
                            padding-bottom: 10px;
                        }
                        .student-info {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 30px;
                            background-color: #f8fafc;
                            border: 1px solid #e2e8f0;
                        }
                        .student-info td {
                            padding: 12px 20px;
                            font-size: 14px;
                            border: 1px solid #e2e8f0;
                        }
                        .grades-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 45px;
                        }
                        .grades-table th {
                            background-color: #1e3a8a;
                            color: white;
                            font-weight: bold;
                            text-transform: uppercase;
                            font-size: 11px;
                            letter-spacing: 0.5px;
                            padding: 12px 10px;
                            border: 1px solid #1e3a8a;
                        }
                        .grades-table tr:nth-child(even) {
                            background-color: #f8fafc;
                        }
                        .summary-box {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 60px;
                            border: 2px solid #1e3a8a;
                            background-color: #eff6ff;
                        }
                        .summary-box td {
                            padding: 15px 25px;
                            font-size: 16px;
                        }
                        .footer-section {
                            width: 100%;
                            margin-top: 50px;
                        }
                        .signature-box {
                            width: 300px;
                            text-align: center;
                            border-top: 1px dashed #94a3b8;
                            padding-top: 10px;
                            font-size: 12px;
                            color: #64748b;
                        }
                        @media print {
                            body {
                                padding: 20px;
                            }
                            .no-print {
                                display: none !important;
                            }
                        }
                        .btn-print {
                            background-color: #1e3a8a;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            font-size: 14px;
                            font-weight: bold;
                            border-radius: 8px;
                            cursor: pointer;
                            margin-bottom: 25px;
                            transition: background-color 0.2s;
                        }
                        .btn-print:hover {
                            background-color: #1d4ed8;
                        }
                    </style>
                </head>
                <body>
                    <div style="text-align: right;" class="no-print">
                        <button class="btn-print" onclick="window.print()">🖨️ Imprimer / Enregistrer en PDF</button>
                    </div>
                    
                    <table class="header-table">
                        <tr>
                            <td width="35%">
                                <div style="font-weight: 800; font-size: 14px; color: #1e3a8a; text-transform: uppercase;">UNIVERSITÉ HASSAN II</div>
                                <div style="font-weight: 600; font-size: 12px; color: #1e3a8a;">ÉCOLE SUPÉRIEURE DE TECHNOLOGIE</div>
                                <div style="font-size: 11px; color: #64748b;">Rabat, Maroc</div>
                            </td>
                            <td width="30%" align="center">
                                <span style="font-size: 32px;">🏫</span>
                            </td>
                            <td width="35%" align="right" style="font-size: 12px; color: #64748b;">
                                Date d'édition : ${currentDate}
                            </td>
                        </tr>
                    </table>

                    <div class="header-title">Relevé de Notes & Bulletin Académique</div>
                    <br/>

                    <table class="student-info">
                        <tr>
                            <td width="50%"><strong>Nom & Prénom :</strong> ${profile?.nom} ${profile?.prenom}</td>
                            <td width="50%"><strong>Filière :</strong> ${profile?.filiere?.code || 'Non spécifié'} - ${profile?.filiere?.libelle || ''}</td>
                        </tr>
                        <tr>
                            <td><strong>CNE (Identifiant national) :</strong> ${profile?.cne}</td>
                            <td><strong>Année Universitaire :</strong> 2025/2026</td>
                        </tr>
                    </table>

                    <table class="grades-table">
                        <thead>
                            <tr>
                                <th width="35%">Matière</th>
                                <th width="10%">CC1</th>
                                <th width="10%">CC2</th>
                                <th width="10%">Examen</th>
                                <th width="10%">Rattrapage</th>
                                <th width="12%">Note/20</th>
                                <th width="13%">Résultat</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${subjectsHtml}
                        </tbody>
                    </table>

                    <table class="summary-box">
                        <tr>
                            <td width="50%"><strong>Moyenne Générale :</strong> <span style="font-size: 1.3em; font-weight: 900; color: #1e3a8a;">${moyenne} / 20</span></td>
                            <td width="50%" align="right"><strong>Résultat Global :</strong> <span style="font-size: 1.1em; text-transform: uppercase;">${globalStatus}</span></td>
                        </tr>
                    </table>

                    <table class="footer-section" width="100%">
                        <tr>
                            <td width="50%">
                                <p style="font-size: 11px; color: #64748b; margin-bottom: 70px;"><em>Le présent bulletin est officiel et infalsifiable. Toute rature l'annule.</em></p>
                            </td>
                            <td width="50%" align="right">
                                <div style="margin-bottom: 70px; font-size: 13px; font-weight: 500;">Fait à Rabat, le ${currentDate}</div>
                                <div class="signature-box">
                                    <strong>Le Directeur de l'Établissement</strong><br/>
                                    Cachet et Signature de l'Administration
                                </div>
                            </td>
                        </tr>
                    </table>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500 font-medium">Chargement de vos données...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Profile Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold">{profile?.nom} {profile?.prenom}</h1>
                            <p className="text-blue-100 font-medium mt-1">CNE: {profile?.cne} &bull; Filière: {profile?.filiere?.code || 'Non assigné'}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
                            <div className="bg-white/20 p-3 rounded-xl">
                                <Award className="w-6 h-6 text-yellow-300" />
                            </div>
                            <div>
                                <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Moyenne Générale</p>
                                <p className="text-3xl font-black">{moyenne} <span className="text-lg text-blue-200 font-bold">/ 20</span></p>
                            </div>
                        </div>
                        
                        <button
                            onClick={handlePrintBulletin}
                            className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-4 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-2 border border-white/10 shrink-0"
                        >
                            <Printer className="w-5 h-5" />
                            Mon Bulletin
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Roadmap Premium Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-1 shadow-lg shadow-indigo-500/10 border border-indigo-100/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <div className="bg-white rounded-[22px] p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-3 rounded-2xl">
                            <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">Mon Coach IA</h2>
                            <p className="text-sm font-semibold text-slate-500">Plan de réussite personnalisé par Gemini 2.5</p>
                        </div>
                    </div>
                    
                    {roadmapLoading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
                            <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
                            <div className="h-4 bg-slate-100 rounded-full w-5/6"></div>
                        </div>
                    ) : (
                        <div className="prose prose-indigo max-w-none">
                            {renderMarkdown(roadmap)}
                        </div>
                    )}
                </div>
            </div>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.length === 0 ? (
                    <div className="col-span-full bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-900">Aucun sujet</h3>
                        <p className="text-slate-500">Aucun sujet n'est configuré pour votre filière.</p>
                    </div>
                ) : (
                    notes.map((note) => {
                        const nCc1 = note.cc1;
                        const nCc2 = note.cc2;
                        const nExamen = note.examen;
                        const nRattrapage = note.rattrapage;
                        
                        const hasCc1 = nCc1 !== null && nCc1 !== undefined;
                        const hasCc2 = nCc2 !== null && nCc2 !== undefined;
                        const hasExamen = nExamen !== null && nExamen !== undefined;
                        
                        let ccAvg = 0;
                        let ccCount = 0;
                        if (hasCc1) { ccAvg += nCc1; ccCount++; }
                        if (hasCc2) { ccAvg += nCc2; ccCount++; }
                        ccAvg = ccCount > 0 ? (ccAvg / ccCount) : 0;

                        const initialAverage = (ccAvg * 0.25) + ((hasExamen ? nExamen : 0) * 0.75);
                        const isInitialReady = hasCc1 && hasCc2 && hasExamen;
                        const isRattrapageActive = nRattrapage !== null && nRattrapage !== undefined;

                        return (
                            <div key={note.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${note.isSaisie && note.valeur >= 10 ? 'bg-green-500' : note.isSaisie ? 'bg-red-500' : 'bg-slate-300'}`} />
                                
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Note Finale</span>
                                        {note.isSaisie && note.valeur !== null ? (
                                            <p className={`text-2xl font-black ${note.valeur >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                                                {note.valeur.toFixed(2)}
                                            </p>
                                        ) : (
                                            <p className="text-sm font-bold text-slate-400 italic mt-1">Non saisie</p>
                                        )}
                                    </div>
                                </div>
                                
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{note.matiere?.libelle}</h3>
                                <p className="text-sm font-semibold text-slate-500 bg-slate-50 inline-block px-3 py-1 rounded-lg mb-4">
                                    {note.matiere?.code}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                                    <div className="flex justify-between p-1 bg-white rounded-lg px-2">
                                        <span>CC1:</span>
                                        <span className="font-extrabold text-slate-800">{note.isSaisie && hasCc1 ? `${nCc1}/20` : '-'}</span>
                                    </div>
                                    <div className="flex justify-between p-1 bg-white rounded-lg px-2">
                                        <span>CC2:</span>
                                        <span className="font-extrabold text-slate-800">{note.isSaisie && hasCc2 ? `${nCc2}/20` : '-'}</span>
                                    </div>
                                    <div className="flex justify-between p-1 bg-white rounded-lg px-2 col-span-2">
                                        <span>Examen Final:</span>
                                        <span className="font-extrabold text-slate-800">{note.isSaisie && hasExamen ? `${nExamen}/20` : '-'}</span>
                                    </div>
                                    <div className="flex justify-between p-1 bg-white rounded-lg px-2 col-span-2">
                                        <span>Moyenne Initiale:</span>
                                        <span className={`font-extrabold ${note.isSaisie && isInitialReady ? (initialAverage >= 10 ? 'text-green-600' : 'text-red-600') : 'text-slate-400'}`}>
                                            {note.isSaisie && isInitialReady ? `${initialAverage.toFixed(2)}/20` : '-'}
                                        </span>
                                    </div>
                                    {note.isSaisie && isRattrapageActive && (
                                        <div className="flex justify-between p-1 bg-amber-50 rounded-lg px-2 col-span-2 text-amber-800 border border-amber-100">
                                            <span>Rattrapage:</span>
                                            <span className="font-black">{nRattrapage}/20</span>
                                        </div>
                                    )}
                                </div>
                                
                                {note.isSaisie ? (
                                    note.observation ? (
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <p className="text-sm text-slate-600 italic">"{note.observation}"</p>
                                        </div>
                                    ) : null
                                ) : (
                                    <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                                        <p className="text-xs text-slate-400 italic">Non encore publiée par le prof</p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default MesNotes;
