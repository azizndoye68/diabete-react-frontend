import React, { useState, useEffect } from "react";
import { Container, Row, Col, Nav } from "react-bootstrap";
import SidebarMedecin from "../components/SidebarMedecin";
import PatientsTable from "../components/PatientsTable";
import AlerteSection from "../components/AlerteSection";
import MessagesSection from "../components/MessagesSection";
import StatsSection from "../components/StatsSection";
import RendezvousSection from "../components/RendezvousSection";
import api from "../services/api";
import "./DashboardMedecin.css";

function DashboardMedecin() {
  const [activeTab, setActiveTab] = useState("patients");
  const [medecin, setMedecin] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Récupérer le profil utilisateur connecté
        const profileRes = await api.get("/api/auth/profile");
        const userData = profileRes.data;

        // 2️⃣ Récupérer les infos détaillées du médecin
        const medRes = await api.get(`/api/medecins/byUtilisateur/${userData.id}`);
        setMedecin(medRes.data);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération du profil médecin :", error);
      }
    };

    fetchData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "patients":
        return <PatientsTable medecinId={medecin?.id} />;
      case "alertes":
        return <AlerteSection medecinId={medecin?.id} />;
      case "messages":
        return <MessagesSection medecinId={medecin?.id} />;
      case "stats":
        return <StatsSection medecinId={medecin?.id} />;
      case "rendezvous":
        return <RendezvousSection medecinId={medecin?.id} />;
      default:
        return <PatientsTable medecinId={medecin?.id} />;
    }
  };

  return (
    <div className="dashboard-medecin-container d-flex">
      {/* Sidebar */}
      <SidebarMedecin user={medecin} />

      {/* Contenu principal */}
      <div className="dashboard-content flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <Container fluid>
          <Row className="mb-4">
            <Col>
              <h3 className="fw-bold text-success">
                Bonjour Dr. {medecin?.prenom || ""} {medecin?.nom || ""}
              </h3>
              <p className="text-muted">Bienvenue sur votre espace professionnel 👨‍⚕️</p>
            </Col>
          </Row>

          {/* Navigation par onglets */}
          <Row className="mb-3">
            <Col>
              <Nav variant="tabs" activeKey={activeTab} onSelect={(tab) => setActiveTab(tab)}>
                <Nav.Item>
                  <Nav.Link eventKey="patients">👥 Patients</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="alertes">🚨 Alertes</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="messages">💬 Messages</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="stats">📊 Statistiques</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="rendezvous">📅 Rendez-vous</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
          </Row>

          {/* Contenu dynamique */}
          <Row>
            <Col>{renderContent()}</Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default DashboardMedecin;
