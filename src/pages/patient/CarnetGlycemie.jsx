import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Badge, Button } from 'react-bootstrap';
import SidebarPatient from '../../components/SidebarPatient';
import AideModal from '../../components/AideModal';
import api from '../../services/api';
import './CarnetGlycemie.css';
import { useParams, useNavigate } from 'react-router-dom';

function CarnetGlycemie() {
  const [patient, setPatient] = useState(null);
  const [groupedByDate, setGroupedByDate] = useState({});
  const [showAide, setShowAide] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { patientId } = useParams();
  const navigate = useNavigate();

  // Horloge en temps réel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let realPatientId;
        let patientData;

        if (patientId) {
          const patientRes = await api.get(`/api/patients/${patientId}`);
          patientData = patientRes.data;
          realPatientId = patientId;
        } else {
          const profileRes = await api.get('/api/auth/profile');
          const utilisateurId = profileRes.data.id;
          const patientRes = await api.get(`/api/patients/byUtilisateur/${utilisateurId}`);
          patientData = patientRes.data;
          realPatientId = patientData.id;
        }

        setPatient(patientData);

        const res = await api.get(`/api/suivis/recentes?patientId=${realPatientId}`);
        const data = Array.isArray(res.data) ? res.data : [];

        // Regrouper par date et trier
        const grouped = data.reduce((acc, m) => {
          const date = new Date(m.dateSuivi).toLocaleDateString('fr-FR');
          if (!acc[date]) acc[date] = [];
          acc[date].push(m);
          return acc;
        }, {});

        // Trier les mesures de chaque jour par heure
        Object.keys(grouped).forEach(date => {
          grouped[date].sort((a, b) => new Date(b.dateSuivi) - new Date(a.dateSuivi));
        });

        setGroupedByDate(grouped);
      } catch (err) {
        console.error('Erreur lors du chargement du carnet de glycémie :', err);
      }
    };

    fetchData();
  }, [patientId]);

  // Fonction pour obtenir le statut de la glycémie
  const getGlycemieStatus = (value) => {
    if (value < 0.7) return { text: 'Faible', variant: 'warning', bgClass: 'status-low' };
    if (value >= 0.7 && value <= 1.2) return { text: 'Normal', variant: 'success', bgClass: 'status-normal' };
    return { text: 'Élevé', variant: 'danger', bgClass: 'status-high' };
  };

  // Icônes selon le moment et le repas
  const getMomentInfo = (moment, repas) => {
    const repasIcons = {
      'petit_dejeuner': { icon: 'bi-cup-hot-fill', color: '#ffc107', label: 'Petit-déjeuner' },
      'dejeuner': { icon: 'bi-brightness-high-fill', color: '#17a2b8', label: 'Déjeuner' },
      'diner': { icon: 'bi-moon-stars-fill', color: '#764ba2', label: 'Dîner' },
      'collation': { icon: 'bi-cookie', color: '#fd7e14', label: 'Collation' }
    };

    const info = repasIcons[repas] || { icon: 'bi-circle-fill', color: '#6c757d', label: repas };
    const momentText = moment === 'avant_repas' ? 'Avant' : 'Après';

    return { ...info, momentText };
  };

  return (
    <div className="carnet-wrapper">
      <SidebarPatient
        onShowAide={() => setShowAide(true)}
        patient={patient}
        isMedecin={!!patientId}
      />

      <div className="carnet-main-content">
        {/* En-tête avec le même style que Dashboard */}
        <div className="carnet-header">
          <div className="header-content">
            <div className="welcome-section">
              <div className="greeting-text">
                <h1 className="display-6 fw-bold mb-0">
                  <i className="bi bi-journal-medical me-3"></i>
                  Carnet de Glycémie
                </h1>
                <p className="text-muted mb-0">
                  {patient ? `Suivi de ${patient.prenom} ${patient.nom}` : 'Chargement...'}
                </p>
              </div>
              <div className="header-time">
                <div className="time-display">
                  {currentTime.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>

            <div className="header-actions">
              <Button
                variant="light"
                className="action-header-btn"
                onClick={() => navigate(patientId ? `/medecin/patient/${patientId}` : '/dashboard-patient')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Retour
              </Button>
              <Button
                variant="light"
                className="action-header-btn"
                onClick={() => navigate(patientId ? `/medecin/patient/${patientId}/ajouter-donnees` : '/ajouter-donnees')}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Nouvelle mesure
              </Button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="carnet-content">
          {Object.entries(groupedByDate).length === 0 ? (
            <Card className="empty-state-card">
              <Card.Body className="text-center p-5">
                <div className="empty-icon mb-4">
                  <i className="bi bi-inbox"></i>
                </div>
                <h4 className="mb-3">Aucune mesure enregistrée</h4>
                <p className="text-muted mb-4">
                  Commencez à suivre votre glycémie en ajoutant votre première mesure
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="btn-action"
                  onClick={() => navigate(patientId ? `/medecin/patient/${patientId}/ajouter-donnees` : '/ajouter-donnees')}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Ajouter une mesure
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <div className="timeline-container">
              {Object.entries(groupedByDate)
                .sort(([dateA], [dateB]) => {
                  const [dayA, monthA, yearA] = dateA.split('/');
                  const [dayB, monthB, yearB] = dateB.split('/');
                  return new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA);
                })
                .map(([date, mesures]) => (
                  <div key={date} className="date-group">
                    <div className="date-header">
                      <div className="date-badge">
                        <i className="bi bi-calendar-event me-2"></i>
                        <span>{date}</span>
                      </div>
                      <div className="date-line"></div>
                    </div>

                    <div className="mesures-list">
                      {mesures.map((m) => {
                        const status = getGlycemieStatus(m.glycemie);
                        const momentInfo = getMomentInfo(m.moment, m.repas);

                        return (
                          <Card className={`mesure-card ${status.bgClass}`} key={m.id}>
                            <Card.Body>
                              <Row className="align-items-center">
                                <Col md={3}>
                                  <div className="mesure-time">
                                    <i className="bi bi-clock-fill me-2"></i>
                                    <strong>
                                      {new Date(m.dateSuivi).toLocaleTimeString('fr-FR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </strong>
                                  </div>
                                </Col>

                                <Col md={3}>
                                  <div className="mesure-repas">
                                    <i className={`${momentInfo.icon} me-2`} style={{ color: momentInfo.color }}></i>
                                    <div>
                                      <div className="repas-label">{momentInfo.label}</div>
                                      <small className="text-muted">{momentInfo.momentText} repas</small>
                                    </div>
                                  </div>
                                </Col>

                                <Col md={3}>
                                  <div className="mesure-value">
                                    <span className="value-number">{m.glycemie}</span>
                                    <span className="value-unit">g/L</span>
                                  </div>
                                </Col>

                                <Col md={3} className="text-end">
                                  <Badge bg={status.variant} className="status-badge">
                                    <i className="bi bi-circle-fill me-1"></i>
                                    {status.text}
                                  </Badge>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <AideModal show={showAide} onHide={() => setShowAide(false)} />
    </div>
  );
}

export default CarnetGlycemie;