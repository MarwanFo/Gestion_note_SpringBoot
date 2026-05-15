import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
import MainDashboard from './components/MainDashboard';
import EtudiantsList from './pages/admin/EtudiantsList';
import ProfesseursList from './pages/admin/ProfesseursList';
import MatieresList from './pages/admin/MatieresList';
import FilieresList from './pages/admin/FilieresList';
import SaisieNotes from './pages/prof/SaisieNotes';
import MesClasses from './pages/prof/MesClasses';
import MesNotes from './pages/etudiant/MesNotes';

function App() {
  return (
    <Router>
      <div className="w-full min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<MainDashboard />} />
            <Route path="etudiants" element={<EtudiantsList />} />
            <Route path="professeurs" element={<ProfesseursList />} />
            <Route path="matieres" element={<MatieresList />} />
            <Route path="filieres" element={<FilieresList />} />
            <Route path="saisie-notes" element={<SaisieNotes />} />
            <Route path="mes-classes" element={<MesClasses />} />
            <Route path="mes-notes" element={<MesNotes />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
