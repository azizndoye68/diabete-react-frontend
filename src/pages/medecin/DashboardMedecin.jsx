// src/pages/DashboardMedecin.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import TopbarMedecin from "../../components/TopbarMedecin";
import PatientsTable from "./PatientsTable";
import api from "../../services/api";
import "./DashboardMedecin.css";

function DashboardMedecin() {
  const [medecin, setMedecin] = useState(null);

  useEffect(() => {
    const fetchMedecin = async () => {
      try {
        const profileRes = await api.get("/api/auth/profile");
        const userData = profileRes.data;

        const medRes = await api.get(
          `/api/medecins/byUtilisateur/${userData.id}`
        );
        setMedecin(medRes.data);
      } catch (error) {
        console.error(
          "❌ Erreur lors de la récupération du profil médecin :",
          error
        );
      }
    };

    fetchMedecin();
  }, []);

  return (
    <div className="dashboard-medecin-container">
      {/* 🔹 Topbar */}
      <TopbarMedecin user={medecin} />

      {/* 🔹 Contenu */}
      <div className="dashboard-content">
        <Container fluid>
          {/* En-tête */}
          <Row className="mb-1">
            <Col>
              <h3 className="fw-bold text-success">
                Bonjour Dr. {medecin?.prenom || ""} {medecin?.nom || ""}
              </h3>

              {medecin?.numeroProfessionnel && (
                <p className="text-secondary mb-1">
                  <strong>Numéro professionnel :</strong>{" "}
                  {medecin.numeroProfessionnel}
                </p>
              )}

            </Col>
          </Row>

          {/* Liste des patients */}
          <Row>
            <Col>
              <PatientsTable medecinId={medecin?.id} />
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default DashboardMedecin;
