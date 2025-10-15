// src/pages/DashboardPatient.jsx
import React, { useEffect, useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import SidebarPatient from '../components/SidebarPatient';
import DashboardCard from '../components/DashboardCard';
import api from '../services/api';
import './DashboardPatient.css';
import { useNavigate } from 'react-router-dom';
import AideModal from '../components/AideModal';
import GlycemieChart from '../components/GlycemieChart';

function DashboardPatient() {
  const [patient, setPatient] = useState(null); 
  const [glycemie, setGlycemie] = useState(null);
  const [glycemies, setGlycemies] = useState([]);
  const [showAide, setShowAide] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔹 Profil utilisateur connecté
        const profileRes = await api.get('/api/auth/profile');
        const utilisateurId = profileRes.data.id;

        // 🔹 Patient lié à cet utilisateur
        const patientRes = await api.get(`/api/patients/byUtilisateur/${utilisateurId}`);
        setPatient(patientRes.data);

        const realPatientId = patientRes.data.id; // Utiliser l'id réel du patient
        console.log("📍 Patient ID utilisé pour les suivis:", realPatientId);

        // 🔹 Récupérer le dernier suivi et les 7 derniers suivis
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
          console.warn("⚠️ Pas de suivi pour ce patient encore", err);
        }

        setGlycemie(lastGly);
        setGlycemies(recentGly);

      } catch (error) {
        console.error('❌ Erreur lors du chargement du dashboard patient:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Row className="m-0 vh-100">
      <SidebarPatient onShowAide={() => setShowAide(true)} patient={patient} />

      <Col md={{ span: 9, offset: 3 }} className="content p-5 dashboard-container">

        {patient && (
          <h3 className="mb-4">Bonjour {patient.prenom} {patient.nom}</h3>
        )}

        <Row xs={1} md={2} className="g-4">

          {/* Glycémie Actuelle */}
          <Col>
            <DashboardCard title={<><i className="bi bi-droplet-half me-2 text-success"></i>Glycémie Actuelle</>}>
              {glycemie ? (
                <>
                  <h2 className="text-success fw-bold">{glycemie.glycemie} g/L</h2>
                  <p>{glycemie.moment === 'avant_repas' ? 'Avant' : 'Après'} le {glycemie.repas}</p>
                  <p className="text-muted">
                    Mesuré le {glycemie.dateSuivi
                      ? new Date(glycemie.dateSuivi).toLocaleString('fr-FR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })
                      : 'Date inconnue'}
                  </p>
                </>
              ) : (
                <p className="text-muted">Aucune mesure récente</p>
              )}
              <Button variant="outline-success" size="sm" onClick={() => navigate('/ajouter-donnees')}>
                + Ajouter une mesure
              </Button>
            </DashboardCard>
          </Col>

          {/* Tendance Récente */}
          <Col>
            <DashboardCard title={<><i className="bi bi-graph-up me-2 text-primary"></i>Tendance Récente</>}>
              {glycemies.length > 0 ? (
                <GlycemieChart data={glycemies} />
              ) : (
                <p className="text-muted">Pas encore assez de données pour afficher une tendance</p>
              )}
              <p className="text-muted">Stabilité sur 7 jours</p>
              <Button variant="outline-success" size="sm" onClick={() => navigate('/carnet')}>
                Voir l'historique
              </Button>
            </DashboardCard>
          </Col>

          {/* Accès rapide */}
          <Col>
            <DashboardCard title={<><i className="bi bi-lightning-fill me-2 text-info"></i>Accès Rapide</>}>
              <ul className="list-unstyled">
                <li className="mb-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/carnet')}>
                  <i className="bi bi-journal-bookmark me-2"></i>Ouvrir le Journal
                </li>
                <li className="mb-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/messages')}>
                  <i className="bi bi-chat-left-text me-2"></i>Voir les Messages
                </li>
                <li style={{ cursor: 'pointer' }} onClick={() => navigate('/parametres')}>
                  <i className="bi bi-gear me-2"></i>Paramètres
                </li>
              </ul>
            </DashboardCard>
          </Col>

        </Row>
      </Col>

      <AideModal show={showAide} onHide={() => setShowAide(false)} />
    </Row>
  );
}

export default DashboardPatient;
