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
import Education from './components/Education';
import DashboardMedecin from './components/DashboardMedecin';
import Messagerie from './components/Messagerie';
import PatientsMedecin from './components/PatientsMedecin';
import PatientsTable from './components/PatientsTable';
import RendezVousCalendar from './components/RendezVousTable';


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
        <Route path="/ajouter-donnees" element={<AjouterDonneesJournee />} />
        <Route path="/carnet" element={<CarnetGlycemie />} />
        <Route path="/statistiques" element={<Statistiques />} />
        <Route path="/education" element={<Education />} />
        <Route path="/medecin/messagerie" element={<Messagerie />} />
        <Route path="/medecin/patients" element={<PatientsMedecin />} />
        <Route path="/medecin/patients-table" element={<PatientsTable />} />
        <Route path="/medecin/rendezvous" element={<RendezVousCalendar />} />  
        {/* Ajoute d'autres routes ici si nécessaire */}
      </Routes>
    </Router>
  );
}

export default App;
