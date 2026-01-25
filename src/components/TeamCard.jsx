// src/components/TeamCard.jsx
import React, { useEffect, useState } from "react";
import { Button, Card, Badge, Collapse } from "react-bootstrap";
import * as medecinService from "../services/medecinService";
import AddMemberModal from "../pages/medecin/AddMemberModal";
import "./TeamCard.css";

export default function TeamCard({ equipe, onDelete }) {
  const [medecins, setMedecins] = useState([]);
  const [proprietaire, setProprietaire] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showMedModal, setShowMedModal] = useState(false);
  const [existingIdsSnapshot, setExistingIdsSnapshot] = useState([]);

  /* ================================
     MÉDECIN CONNECTÉ
  ================================ */
  useEffect(() => {
    const loadMedecinConnecte = async () => {
      try {
        const user = await medecinService.getProfile();
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
        const medList = await Promise.all(
          (equipe.medecinsIds || []).map((id) =>
            medecinService.getMedecinById(id),
          ),
        );
        setMedecins(medList);

        if (equipe.medecinProprietaireId) {
          const prop = await medecinService.getMedecinById(
            equipe.medecinProprietaireId,
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
    if (!window.confirm("Retirer ce médecin de l'équipe ?")) return;

    try {
      await medecinService.retirerMedecinEquipe(
        equipe.id,
        medecinId,
        equipe.medecinProprietaireId,
      );

      setMedecins((prev) => prev.filter((m) => m.id !== medecinId));
    } catch (err) {
      console.error("Erreur suppression médecin :", err);
      alert(err?.response?.data?.message || "Suppression impossible.");
    }
  };

  return (
    <>
      <Card className="team-card">
        <div className="team-card-header">
          <div className="team-icon">
            <i className="bi bi-diagram-3-fill"></i>
          </div>

          <div className="team-header-content">
            <div className="team-title-section">
              <h4 className="team-name">{equipe.nom}</h4>
              {isOwner && (
                <Badge bg="primary" className="owner-badge">
                  <i className="bi bi-star-fill me-1"></i>
                  Propriétaire
                </Badge>
              )}
            </div>

            <div className="team-owner">
              <i className="bi bi-person-badge me-2"></i>
              {proprietaire
                ? `Dr. ${proprietaire.prenom} ${proprietaire.nom}`
                : "Chargement..."}
            </div>
          </div>
        </div>

        <Card.Body className="team-card-body">
          <div className="team-stats">
            <div className="stat-item">
              <div className="stat-icon-wrapper">
                <i className="bi bi-people-fill"></i>
              </div>
              <div className="stat-details">
                <div className="stat-value">{medecins.length}</div>
                <div className="stat-label">
                  Médecin{medecins.length > 1 ? "s" : ""}
                </div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon-wrapper">
                <i className="bi bi-heart-pulse-fill"></i>
              </div>
              <div className="stat-details">
                <div className="stat-value">
                  {equipe.patientsIds?.length || 0}
                </div>
                <div className="stat-label">
                  Patient{equipe.patientsIds?.length > 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>

          <div className="team-actions">
            <Button
              className="btn-expand"
              onClick={() => setExpanded(!expanded)}
            >
              <i
                className={`bi bi-chevron-${expanded ? "up" : "down"} me-2`}
              ></i>
              {expanded ? "Masquer les détails" : "Voir les détails"}
            </Button>

            {isOwner && (
              <Button className="btn-delete" onClick={onDelete}>
                <i className="bi bi-trash-fill"></i>
              </Button>
            )}
          </div>

          <Collapse in={expanded}>
            <div className="team-details">
              <div className="details-header">
                <h6>
                  <i className="bi bi-people me-2"></i>
                  Membres de l'équipe
                </h6>
                {isOwner && (
                  <Button
                    size="sm"
                    className="btn-add-member"
                    onClick={() => {
                      setExistingIdsSnapshot(medecins.map((m) => m.id));
                      setShowMedModal(true);
                    }}
                  >
                    <i className="bi bi-plus-lg me-1"></i>
                    Ajouter
                  </Button>
                )}
              </div>

              {medecins.length === 0 ? (
                <div className="empty-members">
                  <i className="bi bi-inbox"></i>
                  <p>Aucun médecin dans cette équipe</p>
                </div>
              ) : (
                <div className="members-list">
                  {medecins.map((m) => (
                    <div key={m.id} className="member-item">
                      <div className="member-avatar">
                        <i className="bi bi-person-circle"></i>
                      </div>

                      <div className="member-info">
                        <div className="member-name">
                          Dr. {m.prenom} {m.nom}
                          {m.id === equipe.medecinProprietaireId && (
                            <Badge bg="warning" className="ms-2">
                              <i className="bi bi-crown-fill"></i>
                            </Badge>
                          )}
                        </div>
                        <div className="member-details">
                          <span>
                            <i className="bi bi-briefcase me-1"></i>
                            {m.specialite || "Non spécifié"}
                          </span>
                          {m.telephone && (
                            <span>
                              <i className="bi bi-telephone me-1"></i>
                              {m.telephone}
                            </span>
                          )}
                        </div>
                      </div>

                      {isOwner && m.id !== equipe.medecinProprietaireId && (
                        <Button
                          size="sm"
                          className="btn-remove-member"
                          onClick={() => handleRemoveMedecin(m.id)}
                        >
                          <i className="bi bi-x-lg"></i>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Collapse>
        </Card.Body>
      </Card>

      {/* MODAL AJOUT MÉDECIN */}
      <AddMemberModal
        show={showMedModal}
        onHide={() => setShowMedModal(false)}
        equipeId={equipe.id}
        proprietaireId={equipe.medecinProprietaireId}
        existingIds={existingIdsSnapshot}

        onAdded={(nouveauMed) => {
          if (nouveauMed && nouveauMed.id) {
            setMedecins((prev) => [...prev, nouveauMed]);
            setExpanded(true);
          }
        }}
      />
    </>
  );
}
