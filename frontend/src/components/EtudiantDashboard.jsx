import React, { useState, useEffect } from 'react';
import { BookOpen, Award, ArrowRight, TrendingUp, Calendar, Bell, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const EtudiantDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, notesRes, matieresRes] = await Promise.all([
                    api.get('/etudiants/me'),
                    api.get('/notes/mes-notes'),
                    api.get('/matieres')
                ]);
                const studentProfile = profileRes.data;
                const studentNotes = notesRes.data;
                
                // Filter subjects to only keep those of the student's filiere
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

                setProfile(studentProfile);
                setNotes(combinedNotes);
            } catch (error) {
                console.error('Erreur de chargement:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Calculate stats using only published grades
    const savedNotes = notes.filter(n => n.isSaisie && n.valeur !== null);
    const moyenne = savedNotes.length > 0 
        ? (savedNotes.reduce((acc, curr) => acc + curr.valeur, 0) / savedNotes.length).toFixed(2)
        : '0.00';

    const topNote = savedNotes.length > 0 ? Math.max(...savedNotes.map(n => n.valeur)).toFixed(2) : '0.00';
    const notesValidees = savedNotes.filter(n => n.valeur >= 10).length;

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
                                <div style="font-weight: 800; font-size: 14px; color: #1e3a8a; text-transform: uppercase;">UPF University</div>
                                <div style="font-size: 11px; color: #64748b;">Fes, Maroc</div>
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
                                <div style="margin-bottom: 70px; font-size: 13px; font-weight: 500;">Fait à Fes, le ${currentDate}</div>
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

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-lg shadow-blue-600/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                        Bonjour, {profile?.prenom} ! 👋
                    </h1>
                    <p className="text-blue-100 max-w-xl text-lg font-medium">
                        Bienvenue sur votre espace étudiant. Vous êtes inscrit en filière <span className="text-white font-bold">{profile?.filiere?.code || 'Non spécifiée'}</span>.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <Link 
                            to="/dashboard/mes-notes"
                            className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
                        >
                            <BookOpen className="w-5 h-5" />
                            Consulter mes notes
                        </Link>
                        <button 
                            onClick={handlePrintBulletin}
                            className="bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/30 px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
                        >
                            <Printer className="w-5 h-5" />
                            Générer mon bulletin
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                        <Award className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Moyenne Globale</p>
                        <h3 className="text-3xl font-black text-slate-900">{moyenne} <span className="text-lg text-slate-400">/ 20</span></h3>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="bg-green-50 p-4 rounded-2xl text-green-600">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Meilleure Note</p>
                        <h3 className="text-3xl font-black text-slate-900">{topNote} <span className="text-lg text-slate-400">/ 20</span></h3>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Modules Validés</p>
                        <h3 className="text-3xl font-black text-slate-900">{notesValidees} <span className="text-lg text-slate-400">/ {notes.length}</span></h3>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Grades */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            Dernières Notes
                        </h2>
                        <Link to="/dashboard/mes-notes" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            Tout voir <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {notes.length === 0 ? (
                            <p className="text-slate-500 text-center py-4">Aucune note pour le moment.</p>
                        ) : (
                            notes.slice(0, 3).map(note => (
                                <div key={note.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-10 rounded-full ${note.isSaisie && note.valeur >= 10 ? 'bg-green-500' : note.isSaisie ? 'bg-red-500' : 'bg-slate-300'}`} />
                                        <div>
                                            <p className="font-bold text-slate-900">{note.matiere?.libelle}</p>
                                            <p className="text-xs font-semibold text-slate-500">{note.matiere?.code}</p>
                                        </div>
                                    </div>
                                    <div className={`text-xl font-black ${note.isSaisie && note.valeur >= 10 ? 'text-green-600' : note.isSaisie ? 'text-red-600' : 'text-slate-400 font-bold italic text-sm'}`}>
                                        {note.isSaisie && note.valeur !== null ? note.valeur.toFixed(2) : 'Non saisie'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Notifications / Info */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
                        <Bell className="w-5 h-5 text-blue-600" />
                        Informations
                    </h2>
                    
                    <div className="space-y-4">
                        <div className="flex gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                            <Calendar className="w-6 h-6 text-blue-600 shrink-0" />
                            <div>
                                <h4 className="font-bold text-slate-900">Semestre en cours</h4>
                                <p className="text-sm text-slate-600 mt-1">Vous êtes actuellement inscrit au semestre d'automne. Assurez-vous de valider tous vos modules avant les examens finaux.</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                            <Award className="w-6 h-6 text-amber-600 shrink-0" />
                            <div>
                                <h4 className="font-bold text-slate-900">Validation</h4>
                                <p className="text-sm text-slate-600 mt-1">Un module est considéré comme validé si la note est supérieure ou égale à 10/20.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EtudiantDashboard;
