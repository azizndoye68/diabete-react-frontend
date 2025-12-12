// src/components/TeamCard.jsx
import React, { useEffect, useState } from "react";
import { Button, Card, ListGroup } from "react-bootstrap";
import api from "../services/api";
import "./TeamCard.css";
import AddMemberModal from "./AddMemberModal";

export default function TeamCard({ equipe, onDelete, onViewDetails }) {
  const [medecins, setMedecins] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [proprietaire, setProprietaire] = useState(null);

  const [medecinConnecte, setMedecinConnecte] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  // Modals
  const [showMedModal, setShowMedModal] = useState(false);

  // Charger le médecin connecté et vérifier s'il est propriétaire
  useEffect(() => {
    const loadMedecinConnecte = async () => {
      try {
        const profile = await api.get("/api/auth/profile");
        const user = profile.data;

        const med = await api.get(`/api/medecins/byUtilisateur/${user.id}`);
        setMedecinConnecte(med.data);

        setIsOwner(med.data.id === equipe.medecinProprietaireId);
      } catch (err) {
        console.error("Erreur récupération médecin connecté :", err);
      }
    };
    loadMedecinConnecte();
  }, [equipe]);

  // Charger les membres et le propriétaire
  useEffect(() => {
    const loadMembers = async () => {
      try {
        // Médecins
        const medPromises = (equipe.medecinsIds || []).map((id) =>
          api.get(`/api/medecins/${id}`).then((r) => r.data)
        );
        setMedecins(await Promise.all(medPromises));

        // Propriétaire
        if (equipe.medecinProprietaireId) {
          const propRes = await api.get(`/api/medecins/${equipe.medecinProprietaireId}`);
          setProprietaire(propRes.data);
        }
      } catch (err) {
        console.error("Erreur chargement membres équipe :", err);
      }
    };

    loadMembers();
  }, [equipe]);

  // Retirer un médecin
  const handleRemoveMedecin = async (id) => {
    if (!medecinConnecte) return;
    try {
      await api.post(
        `/api/equipes/${equipe.id}/retirer-medecin?medecinId=${id}`,
        {},
        { headers: { medecinProprietaireId: equipe.medecinProprietaireId } }
      );
      setMedecins((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Erreur suppression médecin :", err);
      alert("Erreur lors de la suppression du médecin.");
    }
  };

  return (
    <Card className="team-card shadow-sm mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h4 className="team-name">{equipe.nom}</h4>
            <small className="text-muted">
              Propriétaire :{" "}
              {proprietaire
                ? `Dr. ${proprietaire.prenom} ${proprietaire.nom}`
                : equipe.medecinProprietaireId}
            </small>
          </div>

          <div className="d-flex gap-2">
            <Button size="sm" variant="outline-primary" onClick={() => setExpanded((s) => !s)}>
              {expanded ? "Réduire" : "Détails"}
            </Button>

            {isOwner && (
              <Button size="sm" variant="outline-danger" onClick={onDelete}>
                Supprimer
              </Button>
            )}
          </div>
        </div>

        {expanded && (
          <div className="team-details mt-3">
            <div className="col-md-12 mb-3">
              <h5>Médecins ({medecins.length})</h5>

              {isOwner && (
                <Button
                  size="sm"
                  variant="success"
                  className="mb-2"
                  onClick={() => setShowMedModal(true)}
                >
                  + Ajouter
                </Button>
              )}

              <ListGroup>
                {medecins.map((m) => (
                  <ListGroup.Item key={m.id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>
                        Dr. {m.prenom} {m.nom}
                      </strong>
                      <br />
                      Spécialité : {m.specialite} <br />
                      Téléphone : {m.telephone} <br />
                      Email : {m.email}
                    </div>
                    {isOwner && m.id !== equipe.medecinProprietaireId && (
                      <Button size="sm" variant="danger" onClick={() => handleRemoveMedecin(m.id)}>
                        Retirer
                      </Button>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </div>
        )}
      </Card.Body>

      {/* Modal pour ajouter des médecins */}
      <AddMemberModal
        show={showMedModal}
        onHide={() => setShowMedModal(false)}
        type="medecin"
        equipeId={equipe.id}
        proprietaireId={equipe.medecinProprietaireId}
        existingIds={medecins.map((m) => m.id)}
        onAdded={(nouveauMed) => setMedecins((prev) => [...prev, nouveauMed])}
      />
    </Card>
  );
}
