// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import RegisterChoice from './components/RegisterChoice';
import DashboardPatient from './components/DashboardPatient';
import AjouterDonneesJournee from './components/AjouterDonneesJournee';
import CarnetGlycemie from './components/CarnetGlycemie';
import Statistiques from './components/Statistiques';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/choice" element={<RegisterChoice />} />
        <Route path="/dashboard" element={<DashboardPatient />} />
        <Route path="/ajouter-donnees" element={<AjouterDonneesJournee />} />
        <Route path="/carnet" element={<CarnetGlycemie />} />
        <Route path="/statistiques" element={<Statistiques />} />
        {/* Ajoute d'autres routes ici si nécessaire */}
      </Routes>
    </Router>
  );
}

export default App;
