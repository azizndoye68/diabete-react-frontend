// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import PatientRegister from './components/PatientRegister';
import MedecinRegister from './components/MedecinRegister';
import RegisterChoice from './components/RegisterChoice';
import DashboardPatient from './components/DashboardPatient';
import AjouterDonneesJournee from './components/AjouterDonneesJournee';
import CarnetGlycemie from './components/CarnetGlycemie';
import Statistiques from './components/Statistiques';
import DashboardMedecin from './components/DashboardMedecin';
import PatientsMedecin from './components/PatientsMedecin';
import DashboardAdmin from './components/DashboardAdmin';
import PatientsTable from './components/PatientsTable';
import RendezVousCalendar from './components/RendezVousTable';
import PatientsList from './components/PatientsList';
import MedecinsList from './components/MedecinsList';
import MedecinsAttente from './components/MedecinsAttente';
import EquipesMedecin from './components/EquipesMedecin';
import PatientDossier from './components/PatientDossier';
import EducationPage from './components/education/EducationPage';
import Education from './components/Education';
import MonSuivi from './components/MonSuivi';
import CodeCouleur from './components/CodeCouleur';
import EquipeSoignante from './components/EquipeSoignante';

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
        <Route path="/medecin/patients" element={<PatientsMedecin />} />
        <Route path="/medecin/patients-table" element={<PatientsTable />} />
        <Route path="/medecin/rendezvous" element={<RendezVousCalendar />} />  
        <Route path="/admin/patients" element={<PatientsList />} />
        <Route path="/admin/medecins" element={<MedecinsList />} />
        <Route path="/admin/attente" element={<MedecinsAttente />} />
        <Route path="/medecin/equipes" element={<EquipesMedecin />} />
        <Route path="/patient/:id/dossier" element={<PatientDossier />} />
        <Route path="/medecin/education/" element={<EducationPage />} />
        <Route path="/education/" element={<Education />} />
        <Route path="/mon-suivi" element={<MonSuivi />} />
        <Route path="/codes-couleurs" element={<CodeCouleur />} />
        <Route path="/equipe-soignante" element={<EquipeSoignante />} />
        {/* Ajoute d'autres routes ici si nécessaire */}
      </Routes>
    </Router>
  );
}

export default App;
