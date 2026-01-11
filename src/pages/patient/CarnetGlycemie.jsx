import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Badge } from 'react-bootstrap';
import SidebarPatient from '../../components/SidebarPatient';
import AideModal from '../../components/AideModal';
import api from '../../services/api';
import './CarnetGlycemie.css';

function CarnetGlycemie() {
  const [patient, setPatient] = useState(null);
  const [groupedByDate, setGroupedByDate] = useState({});
  const [showAide, setShowAide] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔹 1. Récupérer le profil utilisateur connecté
        const profileRes = await api.get('/api/auth/profile');
        const utilisateurId = profileRes.data.id;

        // 🔹 2. Récupérer le patient associé à cet utilisateur
        const patientRes = await api.get(`/api/patients/byUtilisateur/${utilisateurId}`);
        const patientData = patientRes.data;
        setPatient(patientData);

        const patientId = patientData.id;
        console.log("📍 Patient ID utilisé pour le carnet :", patientId);

        // 🔹 3. Récupérer les mesures de glycémie
        const res = await api.get(`/api/suivis/recentes?patientId=${patientId}`);
        const data = Array.isArray(res.data) ? res.data : [res.data];
        console.log("✅ Données du carnet :", data);

        // 🔹 4. Regrouper les mesures par date
        const grouped = data.reduce((acc, m) => {
          const date = new Date(m.dateSuivi).toLocaleDateString('fr-FR');
          if (!acc[date]) acc[date] = [];
          acc[date].push(m);
          return acc;
        }, {});
        setGroupedByDate(grouped);

      } catch (err) {
        console.error('❌ Erreur lors du chargement du carnet de glycémie :', err);
      }
    };

    fetchData();
  }, []);

  // Icônes selon le moment de la prise
  const getMomentIcon = (moment) => {
    if (moment === 'avant_repas') {
      return <i className="bi bi-sunrise-fill text-warning me-2" title="Avant repas"></i>;
    } else if (moment === 'apres_repas') {
      return <i className="bi bi-sunset-fill text-danger me-2" title="Après repas"></i>;
    } else {
      return <i className="bi bi-clock text-secondary me-2" title="Autre moment"></i>;
    }
  };

  return (
    <>
      <Row className="m-0 vh-100">
        {/* Sidebar fixe */}
        <SidebarPatient onShowAide={() => setShowAide(true)} patient={patient} />

        {/* Contenu principal */}
        <Col md={{ span: 9, offset: 3 }} className="p-5 overflow-auto">

          <h4 className="mb-4">Carnet de glycémie</h4>

          {Object.entries(groupedByDate).length === 0 && (
            <p className="text-muted">Aucune mesure de glycémie disponible.</p>
          )}

          {Object.entries(groupedByDate).map(([date, mesures]) => (
            <div key={date} className="mb-4">
              <h5 className="text-muted mb-3">{date}</h5>

              {mesures.map((m) => (
                <Card className="mb-3 shadow-sm" key={m.id}>
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div>
                      {getMomentIcon(m.moment)}
                      <strong>{m.glycemie} g/L</strong> — {m.moment === 'avant_repas' ? 'Avant' : 'Après'} {m.repas.replace('_', ' ')}
                      {/* <div className="text-muted small mt-1">
                        Symptôme : {m.symptome || 'Aucun'} • Activité : {m.Objectactivite || 'Non précisée'} • Insuline : {m.insuline || 'Aucune'}
                      </div> */}
                    </div>
                    <Badge bg="secondary" pill>
                      {new Date(m.dateSuivi).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Badge>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ))}
        </Col>
      </Row>

      {/* Modal d’aide */}
      {showAide && <AideModal onClose={() => setShowAide(false)} />}
    </>
  );
}

export default CarnetGlycemie;
