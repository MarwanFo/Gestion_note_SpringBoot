import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu, Bell, User as UserIcon } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, [navigate]);

    if (!user) return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">Chargement...</div>;

    const userRole = user.roles ? user.roles[0] : '';

    return (
        <div className="flex h-screen bg-[#f8fafc] font-['Outfit']">
            <Sidebar userRole={userRole} />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl">
                            <Menu className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-slate-800 hidden sm:block">
                            Bienvenue, {user.username}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                        </button>
                        
                        <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-slate-900">{user.username}</p>
                                <p className="text-xs text-slate-500 font-medium">
                                    {userRole === 'ROLE_ADMIN' ? 'Administrateur' : userRole === 'ROLE_PROF' ? 'Professeur' : 'Étudiant'}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                <UserIcon className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet context={{ userRole }} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
