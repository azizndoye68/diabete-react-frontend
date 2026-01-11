// src/pages/DashboardPatient.jsx
import React, { useEffect, useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import SidebarPatient from '../../components/SidebarPatient';
import DashboardCard from '../../components/DashboardCard';
import api from '../../services/api';
import './DashboardPatient.css';
import { useNavigate } from 'react-router-dom';
import AideModal from '../../components/AideModal';
import GlycemieChart from '../../components/GlycemieChart';

function DashboardPatient() {
  const [patient, setPatient] = useState(null);
  const [glycemie, setGlycemie] = useState(null);
  const [glycemies, setGlycemies] = useState([]);
  const [showAide, setShowAide] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get('/api/auth/profile');
        const utilisateurId = profileRes.data.id;

        const patientRes = await api.get(`/api/patients/byUtilisateur/${utilisateurId}`);
        setPatient(patientRes.data);

        const realPatientId = patientRes.data.id;

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
  }, []);

  return (
    <Row className="m-0 vh-100">
      
      {/* Sidebar */}
      <SidebarPatient onShowAide={() => setShowAide(true)} patient={patient} />

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

              <Button 
                variant="outline-success" 
                size="sm" 
                onClick={() => navigate('/ajouter-donnees')}
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
                onClick={() => navigate('/carnet')}
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
