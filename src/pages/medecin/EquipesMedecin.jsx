import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Form, Row, Col } from "react-bootstrap";
import TopbarMedecin from "../../components/TopbarMedecin";
import TeamCard from "../../components/TeamCard";
import AddMemberModal from "./AddMemberModal";
import * as medecinService from "../../services/medecinService";
import api from "../../services/api";
import "./EquipesMedecin.css";

export default function EquipesMedecin() {
  const navigate = useNavigate();

  const [medecin, setMedecin] = useState(null);
  const [equipes, setEquipes] = useState([]);
  const [nomEquipe, setNomEquipe] = useState("");
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [activeEquipeId, setActiveEquipeId] = useState(null);


  /* ===============================
     PROFIL MÉDECIN
  =============================== */
  const loadMedecinProfile = useCallback(async () => {
    try {
      const profileRes = await api.get("/api/auth/profile");
      const user = profileRes.data;

      const medData = await medecinService.getMedecinByUtilisateurId(user.id);
      setMedecin(medData);
    } catch (error) {
      console.error("Erreur chargement profil médecin :", error);
    }
  }, []);

  /* ===============================
     EQUIPES DU MÉDECIN
  =============================== */
  const loadEquipes = useCallback(async () => {
    if (!medecin?.id) return;

    try {
      const data = await medecinService.getEquipesDuMedecin(medecin.id);
      setEquipes(data || []);
    } catch (error) {
      console.error("Erreur chargement équipes :", error);
      setEquipes([]);
    }
  }, [medecin]);

  useEffect(() => {
    loadMedecinProfile();
  }, [loadMedecinProfile]);

  useEffect(() => {
    loadEquipes();
  }, [loadEquipes]);

  /* ===============================
     CRÉER UNE ÉQUIPE
  =============================== */
  const handleCreerEquipe = async () => {
    if (!nomEquipe.trim()) {
      alert("Veuillez saisir un nom d'équipe.");
      return;
    }

    try {
      await medecinService.creerEquipe(
        { nom: nomEquipe.trim() },
        medecin.id
      );

      setNomEquipe("");
      await loadEquipes();
    } catch (error) {
      console.error("Erreur création équipe :", error);
      alert("Impossible de créer l'équipe.");
    }
  };

  /* ===============================
     SUPPRIMER UNE ÉQUIPE
  =============================== */
  const handleSupprimerEquipe = async (equipeId) => {
    if (!window.confirm("Confirmer la suppression de l'équipe ?")) return;

    try {
      await medecinService.supprimerEquipe(equipeId, medecin.id);
      await loadEquipes();
    } catch (error) {
      console.error("Erreur suppression équipe :", error);
      alert("Impossible de supprimer l'équipe.");
    }
  };

  /* ===============================
     MODALES
  =============================== */
  const openAddMedModal = (equipeId) => {
    setActiveEquipeId(equipeId);
    setShowAddMedModal(true);
  };

  const openAddPatientModal = (equipeId) => {
    setActiveEquipeId(equipeId);
    setShowAddPatientModal(true);
  };

  const onMemberAdded = async () => {
    setShowAddMedModal(false);
    setShowAddPatientModal(false);
    await loadEquipes();
  };

  /* ===============================
     NAVIGATION
  =============================== */
  const goToEquipeDetail = (id) => {
    navigate(`/equipes/${id}`);
  };

  return (
    <div className="equipes-wrapper">
      <TopbarMedecin user={medecin} />

      <div className="equipes-main-content">
        

        {/* Contenu principal */}
        <div className="equipes-content">
          {/* Carte de création d'équipe */}
          <Card className="create-team-card">
            <Card.Body>
              <div className="create-team-header">
                <div className="create-team-icon">
                  <i className="bi bi-plus-circle-fill"></i>
                </div>
                <div>
                  <h5 className="mb-1">Créer une nouvelle équipe</h5>
                  <p className="text-muted mb-0">
                    Ajoutez une équipe pour mieux organiser votre travail
                  </p>
                </div>
              </div>

              <div className="create-team-form">
                <Form.Group>
                  <div className="input-with-icon">
                    <i className="bi bi-pencil-fill input-icon"></i>
                    <Form.Control
                      type="text"
                      className="form-control-custom"
                      placeholder="Nom de l'équipe (ex: Diabétologie Dakar)"
                      value={nomEquipe}
                      onChange={(e) => setNomEquipe(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreerEquipe()}
                    />
                  </div>
                </Form.Group>
                <Button
                  className="btn-create-team"
                  onClick={handleCreerEquipe}
                  disabled={!nomEquipe.trim()}
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  Créer l'équipe
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Liste des équipes */}
          {equipes.length === 0 ? (
            <Card className="empty-state-card">
              <Card.Body className="text-center p-5">
                <div className="empty-icon mb-4">
                  <i className="bi bi-people"></i>
                </div>
                <h4 className="mb-3">Aucune équipe pour le moment</h4>
                <p className="text-muted mb-4">
                  Créez votre première équipe pour commencer à collaborer avec d'autres médecins et gérer vos patients
                </p>
              </Card.Body>
            </Card>
          ) : (
            <Row className="g-4">
              {equipes.map((equipe) => (
                <Col key={equipe.id} xs={12} md={6} lg={4}>
                  <TeamCard
                    equipe={equipe}
                    onAddMed={() => openAddMedModal(equipe.id)}
                    onAddPatient={() => openAddPatientModal(equipe.id)}
                    onDelete={() => handleSupprimerEquipe(equipe.id)}
                    onViewDetails={() => goToEquipeDetail(equipe.id)}
                  />
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>

      {/* Modal ajouter médecin */}
      <AddMemberModal
        show={showAddMedModal}
        onHide={() => setShowAddMedModal(false)}
        type="medecin"
        equipeId={activeEquipeId}
        proprietaireId={medecin?.id}
        onAdded={onMemberAdded}
      />

      {/* Modal ajouter patient */}
      <AddMemberModal
        show={showAddPatientModal}
        onHide={() => setShowAddPatientModal(false)}
        type="patient"
        equipeId={activeEquipeId}
        proprietaireId={medecin?.id}
        onAdded={onMemberAdded}
      />
    </div>
  );
}