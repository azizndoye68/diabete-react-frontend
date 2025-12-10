// src/pages/DashboardAdmin.jsx
import React, { useEffect, useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import SidebarAdmin from '../components/SidebarAdmin';
import DashboardCard from '../components/DashboardCard';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import AideModal from '../components/AideModal'; // ← ajout pour utiliser showAide
import './DashboardPatient.css';

function DashboardAdmin() {
  const [admin, setAdmin] = useState(null); // Pour stocker le profil admin
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [attente, setAttente] = useState([]);
  const [showAide, setShowAide] = useState(false); // utilisé pour AideModal
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔹 Récupérer le profil de l'admin connecté
        const profileRes = await api.get('/api/auth/profile');
        setAdmin(profileRes.data);

        // 🔹 Récupérer les stats du dashboard
        const [patientsRes, medecinsRes, attenteRes] = await Promise.all([
          api.get('/api/patients'),
          api.get('/api/medecins'),
          api.get('/api/auth/users/pending/all')
        ]);
        setPatients(patientsRes.data);
        setMedecins(medecinsRes.data);
        setAttente(attenteRes.data);
      } catch (error) {
        console.error('Erreur lors du chargement du dashboard admin', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Row className="m-0 vh-100">
      {/* Passer le profil admin et la fonction pour afficher l'aide */}
      <SidebarAdmin admin={admin} onShowAide={() => setShowAide(true)} />

      <Col md={{ span: 9, offset: 3 }} className="content p-5 dashboard-container">
        {admin && <h3 className="mb-4">Bonjour {admin.username}</h3>}

        <Row xs={1} md={2} className="g-4">
          <Col>
            <DashboardCard title={<><i className="bi bi-people-fill me-2 text-success"></i>Patients</>}>
              <h2 className="text-success fw-bold">{patients.length}</h2>
              <Button variant="outline-success" size="sm" onClick={() => navigate('/admin/patients')}>
                Voir la liste
              </Button>
            </DashboardCard>
          </Col>

          <Col>
            <DashboardCard title={<><i className="bi bi-person-badge-fill me-2 text-primary"></i>Médecins</>}>
              <h2 className="text-primary fw-bold">{medecins.length}</h2>
              <Button variant="outline-primary" size="sm" onClick={() => navigate('/admin/medecins')}>
                Voir la liste
              </Button>
            </DashboardCard>
          </Col>

          <Col>
            <DashboardCard title={<><i className="bi bi-person-check-fill me-2 text-warning"></i>Médecins en attente</>}>
              <h2 className="text-warning fw-bold">{attente.length}</h2>
              <Button variant="outline-warning" size="sm" onClick={() => navigate('/admin/attente')}>
                Gérer les demandes
              </Button>
            </DashboardCard>
          </Col>

          <Col>
            <DashboardCard title={<><i className="bi bi-lightning-fill me-2 text-info"></i>Accès rapide</>}>
              <ul className="list-unstyled">
                <li className="mb-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/patients')}>
                  <i className="bi bi-people me-2"></i>Liste Patients
                </li>
                <li className="mb-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/medecins')}>
                  <i className="bi bi-person-badge me-2"></i>Liste Médecins
                </li>
                <li style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/attente')}>
                  <i className="bi bi-person-check me-2"></i>Médecins en attente
                </li>
              </ul>
            </DashboardCard>
          </Col>
        </Row>
      </Col>

      {/* AideModal pour corriger le warning showAide */}
      <AideModal show={showAide} onHide={() => setShowAide(false)} />
    </Row>
  );
}

export default DashboardAdmin;
