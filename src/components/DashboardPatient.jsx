// src/pages/DashboardPatient.jsx
import React, { useEffect, useState } from "react";
import { Row, Col, Button, Card, Badge, ProgressBar } from "react-bootstrap";
import SidebarPatient from "./SidebarPatient";
import api from "../services/api";
import "./DashboardPatient.css";
import { useNavigate, useParams } from "react-router-dom";
import AideModal from "./AideModal";
import GlycemieChart from "./GlycemieChart";

function DashboardPatient() {
  const [patient, setPatient] = useState(null);
  const [glycemie, setGlycemie] = useState(null);
  const [glycemies, setGlycemies] = useState([]);
  const [showAide, setShowAide] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const navigate = useNavigate();
  const { patientId } = useParams();

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
          const profileRes = await api.get("/api/auth/profile");
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
            api.get(`/api/suivis/recentes?patientId=${realPatientId}`),
          ]);

          lastGly = glyRes.data;
          recentGly = recentGlyRes.data;
        } catch (err) {
          console.warn("Pas encore de suivis");
        }

        setGlycemie(lastGly);
        setGlycemies(recentGly);
      } catch (error) {
        console.error("Erreur Dashboard:", error);
      }
    };

    fetchData();
  }, [patientId]);

  // Fonction pour obtenir le statut de la glycémie
  const getGlycemieStatus = (value) => {
    if (!value) return { text: "N/A", variant: "secondary", icon: "question-circle" };
    if (value < 0.7) return { text: "Faible", variant: "warning", icon: "arrow-down-circle-fill" };
    if (value >= 0.7 && value <= 1.2) return { text: "Normal", variant: "success", icon: "check-circle-fill" };
    return { text: "Élevé", variant: "danger", icon: "arrow-up-circle-fill" };
  };

  const status = getGlycemieStatus(glycemie?.glycemie);

  // Calculer la moyenne des glycémies récentes
  const avgGlycemie = glycemies.length > 0
    ? (glycemies.reduce((sum, g) => sum + g.glycemie, 0) / glycemies.length).toFixed(2)
    : null;

  return (
    <div className="dashboard-wrapper">
      <SidebarPatient
        onShowAide={() => setShowAide(true)}
        patient={patient}
        isMedecin={!!patientId}
      />

      <div className="dashboard-main-content">
        {/* En-tête moderne avec gradient */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <div className="greeting-text">
                <h1 className="display-6 fw-bold mb-0">
                  {patient ? `Bonjour, ${patient.prenom}` : "Chargement..."}
                </h1>
                <p className="text-muted mb-0">
                  {currentTime.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="header-time">
                <div className="time-display">
                  {currentTime.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="notification-btn"
                onClick={() => navigate("/notifications")}
                title="Notifications"
              >
                <i className="bi bi-bell-fill"></i>
                <span className="notification-badge">3</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="dashboard-content">
          {/* Statistiques rapides */}
          <Row className="g-4 mb-4">
            {/* Glycémie actuelle - Grande carte */}
            <Col md={8}>
              <Card className="stat-card stat-card-primary h-100">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-droplet-half stat-icon me-3"></i>
                        <h5 className="mb-0">Glycémie Actuelle</h5>
                      </div>
                      <Badge bg={status.variant} className="mb-3">
                        <i className={`bi bi-${status.icon} me-1`}></i>
                        {status.text}
                      </Badge>
                    </div>
                  </div>

                  {glycemie ? (
                    <>
                      <div className="glycemie-value mb-3">
                        <span className="value-number">{glycemie.glycemie}</span>
                        <span className="value-unit">g/L</span>
                      </div>

                      <div className="glycemie-details">
                        <div className="detail-item">
                          <i className="bi bi-clock-history me-2"></i>
                          <span>
                            {glycemie.moment === "avant_repas" ? "Avant" : "Après"} le{" "}
                            {glycemie.repas}
                          </span>
                        </div>
                        <div className="detail-item">
                          <i className="bi bi-calendar-event me-2"></i>
                          <span>
                            {new Date(glycemie.dateSuivi).toLocaleString("fr-FR")}
                          </span>
                        </div>
                      </div>

                      {/* Barre de progression visuelle */}
                      <div className="mt-4">
                        <div className="d-flex justify-content-between mb-2">
                          <small className="text-muted">Zone normale : 0.7 - 1.2 g/L</small>
                          <small className="text-muted">{glycemie.glycemie} g/L</small>
                        </div>
                        <ProgressBar
                          now={(glycemie.glycemie / 2) * 100}
                          variant={status.variant}
                          style={{ height: "8px" }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="no-data-state">
                      <i className="bi bi-inbox text-muted" style={{ fontSize: "3rem" }}></i>
                      <p className="text-muted mt-3">Aucune mesure récente</p>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    className="w-100 mt-4 btn-action"
                    onClick={() => {
                      if (patientId) {
                        navigate(`/medecin/patient/${patientId}/ajouter-donnees`);
                      } else {
                        navigate("/ajouter-donnees");
                      }
                    }}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Ajouter une mesure
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* Statistiques résumées */}
            <Col md={4}>
              <Row className="g-3">
                <Col xs={12}>
                  <Card className="stat-card-mini">
                    <Card.Body className="p-3">
                      <div className="d-flex align-items-center">
                        <div className="mini-icon bg-info">
                          <i className="bi bi-bar-chart-line-fill"></i>
                        </div>
                        <div className="ms-3">
                          <p className="text-muted mb-0 small">Moyenne 7j</p>
                          <h4 className="mb-0">
                            {avgGlycemie || "--"} <small className="text-muted">g/L</small>
                          </h4>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xs={12}>
                  <Card className="stat-card-mini">
                    <Card.Body className="p-3">
                      <div className="d-flex align-items-center">
                        <div className="mini-icon bg-warning">
                          <i className="bi bi-activity"></i>
                        </div>
                        <div className="ms-3">
                          <p className="text-muted mb-0 small">Mesures</p>
                          <h4 className="mb-0">
                            {glycemies.length} <small className="text-muted">total</small>
                          </h4>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xs={12}>
                  <Card className="stat-card-mini">
                    <Card.Body className="p-3">
                      <div className="d-flex align-items-center">
                        <div className="mini-icon bg-purple">
                          <i className="bi bi-check2-circle"></i>
                        </div>
                        <div className="ms-3">
                          <p className="text-muted mb-0 small">Conformité</p>
                          <h4 className="mb-0">
                            85% <small className="text-muted">cible</small>
                          </h4>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Graphique de tendance */}
          <Row className="g-4 mb-4">
            <Col md={12}>
              <Card className="stat-card">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="mb-1">
                        <i className="bi bi-graph-up me-2 text-primary"></i>
                        Tendance sur 7 jours
                      </h5>
                      <p className="text-muted mb-0 small">
                        Évolution de votre glycémie
                      </p>
                    </div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => {
                        if (patientId) {
                          navigate(`/medecin/patient/${patientId}/carnet`);
                        } else {
                          navigate("/carnet");
                        }
                      }}
                    >
                      <i className="bi bi-journal-text me-2"></i>
                      Voir l'historique complet
                    </Button>
                  </div>

                  {glycemies.length > 0 ? (
                    <div className="chart-container">
                      <GlycemieChart data={glycemies} />
                    </div>
                  ) : (
                    <div className="no-data-state">
                      <i className="bi bi-graph-up text-muted" style={{ fontSize: "3rem" }}></i>
                      <p className="text-muted mt-3">
                        Pas assez de données pour afficher une tendance
                      </p>
                      <p className="small text-muted">
                        Ajoutez des mesures pour voir l'évolution
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Actions rapides */}
          <Row className="g-4">
            <Col md={4}>
              <Card className="action-card h-100" onClick={() => navigate("/carnet")}>
                <Card.Body className="text-center p-4">
                  <div className="action-icon bg-primary mb-3">
                    <i className="bi bi-journal-medical"></i>
                  </div>
                  <h6 className="mb-2">Carnet de suivi</h6>
                  <p className="text-muted small mb-0">
                    Consultez votre historique complet
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="action-card h-100" onClick={() => navigate("/statistiques")}>
                <Card.Body className="text-center p-4">
                  <div className="action-icon bg-purple mb-3">
                    <i className="bi bi-pie-chart-fill"></i>
                  </div>
                  <h6 className="mb-2">Statistiques</h6>
                  <p className="text-muted small mb-0">
                    Analysez vos données en détail
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="action-card h-100" onClick={() => navigate("/patient/education")}>
                <Card.Body className="text-center p-4">
                  <div className="action-icon bg-info mb-3">
                    <i className="bi bi-book-fill"></i>
                  </div>
                  <h6 className="mb-2">Éducation</h6>
                  <p className="text-muted small mb-0">
                    Apprenez à mieux gérer votre diabète
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      <AideModal show={showAide} onHide={() => setShowAide(false)} />
    </div>
  );
}

export default DashboardPatient;