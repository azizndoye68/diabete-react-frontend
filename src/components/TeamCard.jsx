// src/components/TeamCard.jsx
import React, { useEffect, useState } from "react";
import { Button, Card, ListGroup } from "react-bootstrap";
import * as medecinService from "../services/medecinService";
import AddMemberModal from "../pages/medecin/AddMemberModal";
import "./TeamCard.css";

export default function TeamCard({ equipe, onDelete }) {
  const [medecins, setMedecins] = useState([]);
  const [proprietaire, setProprietaire] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showMedModal, setShowMedModal] = useState(false);

  /* ================================
     MÉDECIN CONNECTÉ
  ================================ */
  useEffect(() => {
    const loadMedecinConnecte = async () => {
      try {
        // 1️⃣ Utilisateur connecté
        const user = await medecinService.getProfile();

        // 2️⃣ Médecin correspondant
        const med = await medecinService.getMedecinByUtilisateurId(user.id);

        setIsOwner(med.id === equipe.medecinProprietaireId);
      } catch (err) {
        console.error("Erreur médecin connecté :", err);
      }
    };

    loadMedecinConnecte();
  }, [equipe.medecinProprietaireId]);

  /* ================================
     CHARGEMENT DES MEMBRES & PROPRIÉTAIRE
  ================================ */
  useEffect(() => {
    const loadEquipeData = async () => {
      try {
        // Médecins de l’équipe
        const medList = await Promise.all(
          (equipe.medecinsIds || []).map((id) =>
            medecinService.getMedecinById(id)
          )
        );
        setMedecins(medList);

        // Propriétaire
        if (equipe.medecinProprietaireId) {
          const prop = await medecinService.getMedecinById(
            equipe.medecinProprietaireId
          );
          setProprietaire(prop);
        }
      } catch (err) {
        console.error("Erreur chargement équipe :", err);
      }
    };

    loadEquipeData();
  }, [equipe]);

  /* ================================
     RETIRER UN MÉDECIN
  ================================ */
  const handleRemoveMedecin = async (medecinId) => {
    try {
      await medecinService.retirerMedecinEquipe(
        equipe.id,
        medecinId,
        equipe.medecinProprietaireId
      );

      setMedecins((prev) => prev.filter((m) => m.id !== medecinId));
    } catch (err) {
      console.error("Erreur suppression médecin :", err);
      alert(err?.response?.data?.message || "Suppression impossible.");
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
                : "—"}
            </small>
          </div>

          <div className="d-flex gap-2">
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => setExpanded((v) => !v)}
            >
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
                <ListGroup.Item
                  key={m.id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>
                      Dr. {m.prenom} {m.nom}
                    </strong>
                    <br />
                    Spécialité : {m.specialite || "—"} <br />
                    Téléphone : {m.telephone || "—"}
                  </div>

                  {isOwner && m.id !== equipe.medecinProprietaireId && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleRemoveMedecin(m.id)}
                    >
                      Retirer
                    </Button>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}
      </Card.Body>

      {/* MODAL AJOUT MÉDECIN */}
      <AddMemberModal
        show={showMedModal}
        onHide={() => setShowMedModal(false)}
        equipeId={equipe.id}
        proprietaireId={equipe.medecinProprietaireId}
        existingIds={medecins.map((m) => m.id)}
        onAdded={(nouveauMed) => {
        if (nouveauMed && nouveauMed.id) {
        // ajouter directement le médecin à la liste
        setMedecins((prev) => [...prev, nouveauMed]);
        // étendre automatiquement les détails
        setExpanded(true);
      }
    }}
  />

    </Card>
  );
}
