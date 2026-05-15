import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import ProfDashboard from './ProfDashboard';
import EtudiantDashboard from './EtudiantDashboard';

const MainDashboard = () => {
    const { userRole } = useOutletContext();

    if (userRole === 'ROLE_ADMIN') return <AdminDashboard />;
    if (userRole === 'ROLE_PROF') return <ProfDashboard />;
    if (userRole === 'ROLE_ETUDIANT') return <EtudiantDashboard />;

    return <div>Accès non autorisé</div>;
};

export default MainDashboard;
