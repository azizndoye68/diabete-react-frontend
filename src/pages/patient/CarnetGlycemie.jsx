import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Badge } from 'react-bootstrap';
import SidebarPatient from '../../components/SidebarPatient';
import AideModal from '../../components/AideModal';
import api from '../../services/api';
import './CarnetGlycemie.css';
import { useParams } from 'react-router-dom';

function CarnetGlycemie() {
  const [patient, setPatient] = useState(null);
  const [groupedByDate, setGroupedByDate] = useState({});
  const [showAide, setShowAide] = useState(false);

  const { patientId } = useParams(); // 🔑 Pour le médecin

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

          const patientRes = await api.get(`/api/patients/byUtilisateur/${utilisateurId}`);
          patientData = patientRes.data;
          realPatientId = patientData.id;
        }

        setPatient(patientData);

        // 🔹 Récupérer les mesures de glycémie
        const res = await api.get(`/api/suivis/recentes?patientId=${realPatientId}`);
        const data = Array.isArray(res.data) ? res.data : [];
        console.log("📍 Mesures récupérées :", data);

        // 🔹 Regrouper par date
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
  }, [patientId]);

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
        <SidebarPatient
          onShowAide={() => setShowAide(true)}
          patient={patient}
          isMedecin={!!patientId} // 👈 Indique si le visiteur est médecin
        />

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
      {showAide && <AideModal show={showAide} onHide={() => setShowAide(false)} />}
    </>
  );
}

export default CarnetGlycemie;
