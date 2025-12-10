import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SidebarPatient from '../components/SidebarPatient';
import api from '../services/api';
import './MonSuivi.css';

function MonSuivi() {
  const [patient, setPatient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const profileRes = await api.get('/api/auth/profile');
        const utilisateurId = profileRes.data.id;
        const patientRes = await api.get(`/api/patients/byUtilisateur/${utilisateurId}`);
        setPatient(patientRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPatient();
  }, []);

  const suiviItems = [
    { title: 'Codes couleurs', icon: '/images/graph.png', path: '/codes-couleurs' },
    { title: 'Traitement', icon: '/images/medical-kit.png', path: '/traitement' },
    { title: 'Dossier médical', icon: '/images/folder.png', path: '/dossier-medical' },
  ];

  return (
    <div className="mon-suivi-page">
      <SidebarPatient patient={patient} />

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
