import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SidebarMedecin from "../../components/TopbarMedecin";
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
    <div className="medecin-layout">
      <SidebarMedecin user={medecin} />

      <main className="teams-page">
        <div className="teams-header">
          <h2>Équipes médicales</h2>

          <div className="create-box">
            <input
              type="text"
              className="form-control"
              placeholder="Nom de l'équipe"
              value={nomEquipe}
              onChange={(e) => setNomEquipe(e.target.value)}
            />
            <button
              className="btn btn-success ms-2"
              onClick={handleCreerEquipe}
            >
              Créer
            </button>
          </div>
        </div>

        <section className="teams-grid">
          {equipes.length === 0 ? (
            <div className="empty">
              <p>Aucune équipe pour le moment.</p>
            </div>
          ) : (
            equipes.map((equipe) => (
              <TeamCard
                key={equipe.id}
                equipe={equipe}
                onAddMed={() => openAddMedModal(equipe.id)}
                onAddPatient={() => openAddPatientModal(equipe.id)}
                onDelete={() => handleSupprimerEquipe(equipe.id)}
                onViewDetails={() => goToEquipeDetail(equipe.id)}
              />
            ))
          )}
        </section>
      </main>

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
