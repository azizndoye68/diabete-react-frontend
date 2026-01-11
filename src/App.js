// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import PatientRegister from './components/PatientRegister';
import MedecinRegister from './components/MedecinRegister';
import RegisterChoice from './components/RegisterChoice';
import DashboardPatient from './pages/patient/DashboardPatient';
import AjouterDonneesJournee from './pages/patient/AjouterDonneesJournee';
import CarnetGlycemie from './pages/patient/CarnetGlycemie';
import Statistiques from './components/Statistiques';
import DashboardMedecin from './pages/medecin/DashboardMedecin';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import PatientsTable from './components/PatientsTable';
import RendezVousCalendar from './pages/medecin/RendezVousTable';
import PatientsList from './pages/admin/PatientsList';
import MedecinsList from './pages/admin/MedecinsList';
import MedecinsAttente from './pages/admin/MedecinsAttente';
import EquipesMedecin from './pages/medecin/EquipesMedecin';
import PatientDossier from './pages/patient/PatientDossier';
import MonSuivi from './pages/patient/MonSuivi';
import CodeCouleur from './pages/patient/CodeCouleur';
import EquipeSoignante from './pages/patient/EquipeSoignante';
import EducationMedecin from './pages/medecin/EducationMedecin';
import EducationPatient from './pages/patient/EducationPatient';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/patient" element={<PatientRegister />} />
        <Route path="/register/medecin" element={<MedecinRegister />} />
        <Route path="/register/choice" element={<RegisterChoice />} />
        <Route path="/dashboard-patient" element={<DashboardPatient />} />
        <Route path="/dashboard-medecin" element={<DashboardMedecin />} />
        <Route path="/dashboard-admin" element={<DashboardAdmin />} />
        <Route path="/ajouter-donnees" element={<AjouterDonneesJournee />} />
        <Route path="/carnet" element={<CarnetGlycemie />} />
        <Route path="/statistiques" element={<Statistiques />} />
        <Route path="/medecin/patients-table" element={<PatientsTable />} />
        <Route path="/medecin/rendezvous" element={<RendezVousCalendar />} />  
        <Route path="/admin/patients" element={<PatientsList />} />
        <Route path="/admin/medecins" element={<MedecinsList />} />
        <Route path="/admin/attente" element={<MedecinsAttente />} />
        <Route path="/medecin/equipes" element={<EquipesMedecin />} />
        <Route path="/patient/:id/dossier" element={<PatientDossier />} />
        <Route path="/mon-suivi" element={<MonSuivi />} />
        <Route path="/codes-couleurs" element={<CodeCouleur />} />
        <Route path="/equipe-soignante" element={<EquipeSoignante />} />
        <Route path="/medecin/education" element={<EducationMedecin />} />
        <Route path="/patient/education" element={<EducationPatient />} />
        {/* Ajoute d'autres routes ici si nécessaire */}
      </Routes>
    </Router>
  );
}

export default App;
