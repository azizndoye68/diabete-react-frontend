// src/pages/DashboardPatient.jsx
import React, { useEffect, useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import SidebarPatient from './SidebarPatient';
import DashboardCard from './DashboardCard';
import api from '../services/api';
import './DashboardPatient.css';
import { useNavigate, useParams } from 'react-router-dom';
import AideModal from './AideModal';
import GlycemieChart from './GlycemieChart';

function DashboardPatient() {
  const [patient, setPatient] = useState(null);
  const [glycemie, setGlycemie] = useState(null);
  const [glycemies, setGlycemies] = useState([]);
  const [showAide, setShowAide] = useState(false);

  const navigate = useNavigate();
  const { patientId } = useParams(); // 🔑 AJOUT MINIMAL

  useEffect(() => {
    const fetchData = async () => {
      try {
        let realPatientId;
        let patientData;

        if (patientId) {
          // =====================
          // 👨‍⚕️ CAS MÉDECIN
          // =====================
          const patientRes = await api.get(`/api/patients/${patientId}`);
          patientData = patientRes.data;
          realPatientId = patientId;
        } else {
          // =====================
          // 👤 CAS PATIENT CONNECTÉ
          // =====================
          const profileRes = await api.get('/api/auth/profile');
          const utilisateurId = profileRes.data.id;

          const patientRes = await api.get(
            `/api/patients/byUtilisateur/${utilisateurId}`
          );

          patientData = patientRes.data;
          realPatientId = patientData.id;
        }

        setPatient(patientData);

        let lastGly = null;
        let recentGly = [];

        try {
          const [glyRes, recentGlyRes] = await Promise.all([
            api.get(`/api/suivis/last?patientId=${realPatientId}`),
            api.get(`/api/suivis/recentes?patientId=${realPatientId}`)
          ]);

          lastGly = glyRes.data;
          recentGly = recentGlyRes.data;
        } catch (err) {
          console.warn("Pas encore de suivis");
        }

        setGlycemie(lastGly);
        setGlycemies(recentGly);

      } catch (error) {
        console.error('Erreur Dashboard:', error);
      }
    };

    fetchData();
  }, [patientId]);

  return (
    <Row className="m-0 vh-100">
      
      {/* Sidebar */}
      <SidebarPatient
        onShowAide={() => setShowAide(true)}
        patient={patient}
        isMedecin={!!patientId} // 👈 INFO CONTEXTE
      />

      {/* CONTENU DU DASHBOARD */}
      <Col md={{ span: 9, offset: 3 }} className="content p-5 dashboard-container">

        {/* Icône notification */}
        <i 
          className="bi bi-bell-fill notification-icon" 
          onClick={() => navigate('/notifications')}
          title="Voir les notifications"
        ></i>

        {/* Titre */}
        {patient && (
          <h3 className="mb-5">
            Bonjour {patient.prenom} {patient.nom}
          </h3>
        )}

        {/* CARTES */}
        <Row xs={1} md={2} className="g-4">

          {/* Glycémie actuelle */}
          <Col>
            <DashboardCard 
              title={<><i className="bi bi-droplet-half me-2 text-success"></i>Glycémie Actuelle</>}
            >
              {glycemie ? (
                <>
                  <h2 className="text-success fw-bold">{glycemie.glycemie} g/L</h2>
                  <p>{glycemie.moment === 'avant_repas' ? 'Avant' : 'Après'} le {glycemie.repas}</p>
                  <p className="text-muted">
                    Mesuré le {new Date(glycemie.dateSuivi).toLocaleString('fr-FR')}
                  </p>
                </>
              ) : (
                <p className="text-muted">Aucune mesure récente</p>
              )}

              {/* ❗ Bouton Ajouter une mesure pour patient et médecin */}
              <Button 
                variant="outline-success" 
                size="sm" 
                onClick={() => {
                  if (patientId) {
                    // Médecin → ajoute pour un patient spécifique
                    navigate(`/medecin/patient/${patientId}/ajouter-donnees`);
                  } else {
                    // Patient connecté
                    navigate('/ajouter-donnees');
                  }
                }}
              >
                + Ajouter une mesure
              </Button>
            </DashboardCard>
          </Col>


          {/* Tendance Récente */}
          <Col>
            <DashboardCard 
              title={<><i className="bi bi-graph-up me-2 text-primary"></i>Tendance Récente</>}
            >
              {glycemies.length > 0 ? (
                <GlycemieChart data={glycemies} />
              ) : (
                <p className="text-muted">Pas assez de données pour une tendance</p>
              )}

              <p className="text-muted">Stabilité sur 7 jours</p>

              <Button 
                variant="outline-success" 
                size="sm" 
                onClick={() => {
                if (patientId) {
                navigate(`/medecin/patient/${patientId}/carnet`);
                } else {
                navigate('/carnet');
               }
               }}
        >
                Voir l'historique
              </Button>

            </DashboardCard>
          </Col>

        </Row>
      </Col>

      <AideModal show={showAide} onHide={() => setShowAide(false)} />
    </Row>
  );
}

export default DashboardPatient;
