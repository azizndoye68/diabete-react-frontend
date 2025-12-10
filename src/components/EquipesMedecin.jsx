import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SidebarMedecin from "../components/SidebarMedecin";
import TeamCard from "../components/TeamCard";
import AddMemberModal from "../components/AddMemberModal";
import api from "../services/api";
import "./EquipesMedecin.css";

export default function EquipesMedecin() {
  const navigate = useNavigate();

  const [medecin, setMedecin] = useState(null);
  const [equipes, setEquipes] = useState([]);
  const [nomEquipe, setNomEquipe] = useState("");
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [activeEquipeId, setActiveEquipeId] = useState(null);

  /** Charger profil médecin */
  const loadMedecinProfile = useCallback(async () => {
    try {
      const profileRes = await api.get("/api/auth/profile");
      const user = profileRes.data;
      const medRes = await api.get(`/api/medecins/byUtilisateur/${user.id}`);
      setMedecin(medRes.data);
    } catch (err) {
      console.error("Impossible de charger le profil médecin :", err);
    }
  }, []);

  /** Charger les équipes du médecin */
  const loadEquipes = useCallback(async () => {
    if (!medecin?.id) return;
    try {
      const res = await api.get(`/api/equipes/medecin/${medecin.id}`);
      setEquipes(res.data || []);
    } catch (err) {
      console.error("Erreur chargement équipes :", err);
      setEquipes([]);
    }
  }, [medecin]);

  useEffect(() => { loadMedecinProfile(); }, [loadMedecinProfile]);
  useEffect(() => { loadEquipes(); }, [loadEquipes]);

  /** Créer une équipe */
  const handleCreerEquipe = async () => {
    if (!nomEquipe.trim()) return alert("Veuillez saisir un nom d'équipe.");
    if (!medecin?.id) return alert("Profil médecin non chargé.");

    try {
      await api.post(
        `/api/equipes/creer?nom=${encodeURIComponent(nomEquipe.trim())}`,
        {},
        { headers: { medecinId: medecin.id } }
      );
      setNomEquipe("");
      await loadEquipes();
    } catch (err) {
      console.error("Erreur création équipe :", err);
      alert(err?.response?.data?.message || "Impossible de créer l'équipe.");
    }
  };

  /** Supprimer une équipe */
  const handleSupprimerEquipe = async (equipeId) => {
    if (!window.confirm("Confirmer la suppression de l'équipe ?")) return;

    try {
      await api.delete(`/api/equipes/${equipeId}`, {
        headers: { medecinProprietaireId: medecin.id },
      });
      await loadEquipes();
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert(
        err?.response?.data?.message ||
          "Impossible de supprimer l'équipe. Vérifiez que vous êtes le propriétaire."
      );
    }
  };

  /** Ouvrir modal ajout membre */
  const openAddMedModal = (equipeId) => {
    setActiveEquipeId(equipeId);
    setShowAddMedModal(true);
  };

  const openAddPatientModal = (equipeId) => {
    setActiveEquipeId(equipeId);
    setShowAddPatientModal(true);
  };

  /** Callback après ajout */
  const onMemberAdded = async () => {
    setShowAddMedModal(false);
    setShowAddPatientModal(false);
    await loadEquipes();
  };

  /** Aller au détail équipe */
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
              placeholder="Nom de l'équipe"
              value={nomEquipe}
              onChange={(e) => setNomEquipe(e.target.value)}
              className="form-control"
            />
            <button className="btn btn-success ms-2" onClick={handleCreerEquipe}>
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
            equipes.map((e) => (
              <TeamCard
                key={e.id}
                equipe={e}
                onAddMed={() => openAddMedModal(e.id)}
                onAddPatient={() => openAddPatientModal(e.id)}
                onDelete={() => handleSupprimerEquipe(e.id)}
                onViewDetails={() => goToEquipeDetail(e.id)}
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
