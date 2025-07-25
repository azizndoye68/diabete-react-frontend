// src/pages/CarnetGlycemie.jsx
import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Badge } from 'react-bootstrap';
import SidebarPatient from '../components/SidebarPatient';
import AideModal from '../components/AideModal'; // Assure-toi que ce composant existe
import api from '../services/api';
import './CarnetGlycemie.css';

function CarnetGlycemie() {
  const [groupedByDate, setGroupedByDate] = useState({});
  const [showAide, setShowAide] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await api.get('/api/auth/profile');
        const res = await api.get(`/api/suivis/recentes?patientId=${profile.data.id}`);
        const data = res.data || [];

        const grouped = data.reduce((acc, m) => {
          const date = new Date(m.dateSuivi).toLocaleDateString('fr-FR');
          if (!acc[date]) acc[date] = [];
          acc[date].push(m);
          return acc;
        }, {});

        setGroupedByDate(grouped);
      } catch (err) {
        console.error('Erreur récupération carnet', err);
      }
    };

    fetchData();
  }, []);

  const getMomentIcon = (moment) => {
    return moment === 'avant_repas' ? (
      <i className="bi bi-sunrise-fill text-warning me-2" aria-label="Avant repas"></i>
    ) : (
      <i className="bi bi-sunset-fill text-danger me-2" aria-label="Après repas"></i>
    );
  };

  return (
    <>
      <Row className="m-0 vh-100">
        {/* On transmet la fonction pour ouvrir la modale d’aide à la Sidebar */}
        <SidebarPatient onShowAide={() => setShowAide(true)} />

        <Col md={{ span: 9, offset: 3 }} className="p-5 overflow-auto">
          <h3 className="mb-4">Carnet de glycémie</h3>

          {Object.entries(groupedByDate).length === 0 && (
            <p>Aucune mesure de glycémie disponible.</p>
          )}

          {Object.entries(groupedByDate).map(([date, mesures]) => (
            <div key={date} className="mb-4">
              <h5 className="text-muted mb-3">{date}</h5>
              {mesures.map((m) => (
                <Card className="mb-2 shadow-sm" key={m.id || `${m.dateSuivi}-${m.moment}`}>
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div>
                      {getMomentIcon(m.moment)}
                      <strong>{m.glycemie} g/L</strong> — {m.moment === 'avant_repas' ? 'Avant' : 'Après'} {m.repas}
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

      {/* Modal d’aide, ouverte selon showAide */}
      {showAide && <AideModal onClose={() => setShowAide(false)} />}
    </>
  );
}

export default CarnetGlycemie;
