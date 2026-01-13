import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import SidebarPatient from '../../components/SidebarPatient';
import api from '../../services/api';
import './MonSuivi.css';

function MonSuivi() {
  const [patient, setPatient] = useState(null);
  const navigate = useNavigate();
  const { patientId } = useParams(); // 🔑 Récupère patientId si médecin

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        let patientData;

        if (patientId) {
          // 🔹 CAS MÉDECIN : récupérer le patient par patientId
          const patientRes = await api.get(`/api/patients/${patientId}`);
          patientData = patientRes.data;
        } else {
          // 🔹 CAS PATIENT : récupérer son propre profil
          const profileRes = await api.get('/api/auth/profile');
          const utilisateurId = profileRes.data.id;

          const patientRes = await api.get(`/api/patients/byUtilisateur/${utilisateurId}`);
          patientData = patientRes.data;
        }

        setPatient(patientData);
      } catch (err) {
        console.error('Erreur récupération patient :', err);
      }
    };

    fetchPatient();
  }, [patientId]);

  // Définir les items du suivi
const suiviItems = patient ? [
  { 
    title: 'Codes couleurs', 
    icon: '/images/graph.png', 
    path: patientId 
      ? `/medecin/patient/${patientId}/codes-couleurs` // ✅ côté médecin
      : `/codes-couleurs` // ✅ côté patient
  },
  { 
    title: 'Traitement', 
    icon: '/images/medical-kit.png', 
    path: patientId 
      ? `/medecin/patient/${patientId}/traitement`
      : `/traitement`
  },
  { 
    title: 'Dossier médical', 
    icon: '/images/folder.png', 
    path: patientId 
      ? `/medecin/patient/${patientId}/dossier`
      : `/patient/${patient.id}/dossier`
  },
] : [];


  return (
    <div className="mon-suivi-page">
      <SidebarPatient patient={patient} isMedecin={!!patientId} /> {/* Passer le flag médecin */}

      <div className="main-content">
        <h2 className="mb-4">Mon suivi</h2>

        <div className="cards-wrapper">
          {suiviItems.map((item, idx) => (
            <Card
              key={idx}
              className="suivi-card"
              onClick={() => navigate(item.path)}
            >
              <Card.Body>
                <div className="icon-wrapper">
                  <div className="circle-icon">
                    <img src={item.icon} alt={item.title} className="suivi-icon" />
                  </div>
                </div>
                <Card.Title className="suivi-title">{item.title}</Card.Title>
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MonSuivi;
