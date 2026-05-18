import React, { useState, useEffect } from 'react';
import { BookOpen, Award, TrendingUp, User, Sparkles } from 'lucide-react';
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
            setProfile(profileRes.data);

            // Fetch Notes
            const notesRes = await api.get('/notes/mes-notes');
            setNotes(notesRes.data);

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

    // Calculate Average
    const moyenne = notes.length > 0 
        ? (notes.reduce((acc, curr) => acc + curr.valeur, 0) / notes.length).toFixed(2)
        : 0;

    if (loading) {
        return <div className="p-8 text-center text-slate-500 font-medium">Chargement de vos données...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Profile Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold">{profile?.nom} {profile?.prenom}</h1>
                            <p className="text-blue-100 font-medium mt-1">CNE: {profile?.cne} &bull; Filière: {profile?.filiere?.code || 'Non assigné'}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
                        <div className="bg-white/20 p-3 rounded-xl">
                            <Award className="w-6 h-6 text-yellow-300" />
                        </div>
                        <div>
                            <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Moyenne Générale</p>
                            <p className="text-3xl font-black">{moyenne} <span className="text-lg text-blue-200 font-bold">/ 20</span></p>
                        </div>
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
                        <h3 className="text-lg font-bold text-slate-900">Aucune note disponible</h3>
                        <p className="text-slate-500">Vos professeurs n'ont pas encore saisi vos notes.</p>
                    </div>
                ) : (
                    notes.map((note) => (
                        <div key={note.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${note.valeur >= 10 ? 'bg-green-500' : 'bg-red-500'}`} />
                            
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Note</span>
                                    <p className={`text-2xl font-black ${note.valeur >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                                        {note.valeur}
                                    </p>
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-slate-900 mb-1">{note.matiere?.libelle}</h3>
                            <p className="text-sm font-semibold text-slate-500 bg-slate-50 inline-block px-3 py-1 rounded-lg">
                                {note.matiere?.code}
                            </p>
                            
                            {note.observation && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-sm text-slate-600 italic">"{note.observation}"</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MesNotes;
