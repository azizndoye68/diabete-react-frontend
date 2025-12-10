// src/pages/DashboardMedecin.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Nav, Button } from "react-bootstrap";
import SidebarMedecin from "../components/SidebarMedecin";
import PatientsTable from "../components/PatientsTable";
import AlerteSection from "../components/AlerteSection";
import MessagesSection from "./MessagesSection";
import StatsSection from "../components/StatsSection";
import RendezVousCalendar from "./RendezVousTable";
import RendezVousModal from "../components/RendezVousModal";
import RendezVousService from "../services/rendezvousService";
import api from "../services/api";
import "./DashboardMedecin.css";

function DashboardMedecin() {
  const [activeTab, setActiveTab] = useState("patients");
  const [medecin, setMedecin] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date()); // ✅ pour la date

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get("/api/auth/profile");
        const userData = profileRes.data;

        const medRes = await api.get(`/api/medecins/byUtilisateur/${userData.id}`);
        setMedecin(medRes.data);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération du profil médecin :", error);
      }
    };

    fetchData();
  }, []);

  // ✅ Fonction pour enregistrer un nouveau rendez-vous
  const handleAddRendezVous = async (rdvData) => {
    try {
      const payload = {
        ...rdvData,
        medecinId: medecin?.id,
      };

      await RendezVousService.create(payload);
      setShowModal(false);
    } catch (error) {
      console.error("❌ Erreur lors de l’ajout du rendez-vous :", error);
      alert("Erreur lors de la création du rendez-vous.");
    }
  };

  // ✅ Gestion des onglets
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
        return (
          <div className="rendezvous-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Button
                variant="success"
                onClick={() => {
                  setSelectedDate(new Date());
                  setShowModal(true);
                }}
              >
                + Nouveau rendez-vous
              </Button>
            </div>

            {/* ✅ Le calendrier des rendez-vous */}
            <RendezVousCalendar medecinId={medecin?.id} />
          </div>
        );
      default:
        return <PatientsTable medecinId={medecin?.id} />;
    }
  };

  return (
    <div className="dashboard-medecin-container d-flex">
      <SidebarMedecin user={medecin} />

      <div className="dashboard-content flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <Container fluid>
          <Row className="mb-4">
            <Col>
              <h3 className="fw-bold text-success">
                Bonjour Dr. {medecin?.prenom || ""} {medecin?.nom || ""}
              </h3>

              {medecin?.numeroProfessionnel && (
                <p className="text-secondary mb-1">
                  <strong>Numéro professionnel :</strong> {medecin.numeroProfessionnel}
                </p>
              )}
              <p className="text-muted">Bienvenue sur votre espace professionnel 👨‍⚕️</p>

            </Col>
          </Row>

          {/* Onglets de navigation */}
          <Row className="mb-3">
            <Col>
              <Nav variant="tabs" activeKey={activeTab} onSelect={(tab) => setActiveTab(tab)}>
                <Nav.Item><Nav.Link eventKey="patients">👥 Patients</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="alertes">🚨 Alertes</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="messages">💬 Messages</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="stats">📊 Statistiques</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="rendezvous">📅 Rendez-vous</Nav.Link></Nav.Item>
              </Nav>
            </Col>
          </Row>

          <Row>
            <Col>{renderContent()}</Col>
          </Row>
        </Container>
      </div>

      {/* ✅ Modale pour créer un rendez-vous */}
      <RendezVousModal
        show={showModal}
        onHide={() => setShowModal(false)}
        selectedDate={selectedDate}
        onSave={handleAddRendezVous} // ✅ ajouté
        medecinId={medecin?.id}
      />
    </div>
  );
}

export default DashboardMedecin;
