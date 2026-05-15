import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Users, BookOpen, GraduationCap, Settings, Layers } from 'lucide-react';

const Sidebar = ({ userRole }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getNavItems = () => {
        const items = [
            { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard }
        ];

        if (userRole === 'ROLE_ADMIN') {
            items.push({ path: '/dashboard/etudiants', label: 'Étudiants', icon: Users });
            items.push({ path: '/dashboard/professeurs', label: 'Professeurs', icon: GraduationCap });
            items.push({ path: '/dashboard/matieres', label: 'Matières', icon: BookOpen });
            items.push({ path: '/dashboard/filieres', label: 'Filières', icon: Layers });
        } else if (userRole === 'ROLE_PROF') {
            items.push({ path: '/dashboard/mes-classes', label: 'Mes Classes', icon: Users });
            items.push({ path: '/dashboard/saisie-notes', label: 'Saisie des notes', icon: BookOpen });
        } else if (userRole === 'ROLE_ETUDIANT') {
            items.push({ path: '/dashboard/mes-notes', label: 'Mes Notes', icon: BookOpen });
        }

        return items;
    };

    const navItems = getNavItems();

    return (
        <aside className="w-64 bg-white border-r border-slate-100 flex flex-col hidden md:flex h-screen sticky top-0">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">Gestion Notes</span>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                <div className="mb-6 px-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Menu Principal</p>
                </div>
                {navItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={index}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                                isActive 
                                    ? 'bg-blue-50 text-blue-700' 
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <Link to="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-all font-medium mb-2">
                    <Settings className="w-5 h-5 text-slate-400" />
                    Paramètres
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    Déconnexion
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
