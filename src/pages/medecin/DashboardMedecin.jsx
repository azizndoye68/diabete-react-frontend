// src/pages/medecin/DashboardMedecin.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import TopbarMedecin from "../../components/TopbarMedecin";
import PatientsTable from "./PatientsTable";
import api from "../../services/api";
import "./DashboardMedecin.css";

function DashboardMedecin() {
  const [medecin, setMedecin] = useState(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    patientsReferents: 0,
    alertesActives: 0,
    inactifs: 0,
  });

  /**
   * Callback appelé depuis PatientsTable
   */
  const handleStatsUpdate = useCallback((newStats) => {
    setStats((prev) => ({ ...prev, ...newStats }));
  }, []);

  /**
   * Chargement du médecin + stats initiales
   */
  useEffect(() => {
    const fetchMedecin = async () => {
      try {
        const profileRes = await api.get("/api/auth/profile");
        const userData = profileRes.data;

        const medRes = await api.get(
          `/api/medecins/byUtilisateur/${userData.id}`
        );
        const medecinData = medRes.data;
        setMedecin(medecinData);

        if (medecinData?.id) {
          const patientsRes = await api.get(
            `/api/patients/medecin/${medecinData.id}/visibles`
          );
          const patients = patientsRes.data || [];

          setStats((prev) => ({
            ...prev,
            totalPatients: patients.length,
            patientsReferents: patients.filter(
              (p) => p.medecinId === medecinData.id
            ).length,
          }));
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du profil médecin :",
          error
        );
      }
    };

    fetchMedecin();
  }, []);

  return (
    <div className="dashboard-medecin-wrapper">
      {/* Topbar */}
      <TopbarMedecin user={medecin} />

      <div className="dashboard-medecin-main-content">
        <div className="dashboard-medecin-content">
          <Container fluid>
            {/* Cartes statistiques */}
            <Row className="g-4 mb-4">
              <StatCard
                title="Total patients"
                value={stats.totalPatients}
                icon="bi-people-fill"
                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
              <StatCard
                title="Mes patients référents"
                value={stats.patientsReferents}
                icon="bi-person-check-fill"
                gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
              />
              <StatCard
                title="Alertes actives"
                value={stats.alertesActives}
                icon="bi-exclamation-triangle-fill"
                gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
              />
              <StatCard
                title="Patients inactifs"
                value={stats.inactifs}
                icon="bi-bell-fill"
                gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              />
            </Row>

            {/* Infos médecin */}
            {medecin && (
              <Card className="info-card-medecin mb-4">
                <Card.Body className="p-4">
                  <Row>
                    <Col md={12}>
                      <h5 className="fw-bold mb-3">
                        Informations professionnelles
                      </h5>
                      <Row>
                        {medecin.numeroProfessionnel && (
                          <Col md={6}>
                            <p>
                              <strong>N° Professionnel :</strong>{" "}
                              {medecin.numeroProfessionnel}
                            </p>
                          </Col>
                        )}
                        {medecin.specialite && (
                          <Col md={6}>
                            <p>
                              <strong>Spécialité :</strong>{" "}
                              {medecin.specialite}
                            </p>
                          </Col>
                        )}
                        {medecin.etablissement && (
                          <Col md={6}>
                            <p>
                              <strong>Établissement :</strong>{" "}
                              {medecin.etablissement}
                            </p>
                          </Col>
                        )}
                      </Row>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            {/* Table patients */}
            <Row>
              <Col>
                <PatientsTable
                  medecinId={medecin?.id}
                  onStatsUpdate={handleStatsUpdate}
                />
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </div>
  );
}

/**
 * Carte statistique réutilisable
 */
function StatCard({ title, value, icon, gradient }) {
  return (
    <Col xl={3} md={6}>
      <Card className="stat-card-medecin">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center">
            <div
              className="stat-icon-medecin"
              style={{ background: gradient }}
            >
              <i className={`bi ${icon}`}></i>
            </div>
            <div className="ms-3">
              <p className="text-muted mb-0 small">{title}</p>
              <h3 className="fw-bold mb-0">{value}</h3>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
}

export default DashboardMedecin;
