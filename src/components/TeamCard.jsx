import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import api from "../services/api";
import "./TeamCard.css";
import AddMemberModal from "./AddMemberModal";

export default function TeamCard({ equipe, onDelete, onViewDetails }) {
  const [medecins, setMedecins] = useState([]);
  const [patients, setPatients] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [proprietaire, setProprietaire] = useState(null);

  const [medecinConnecte, setMedecinConnecte] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  // Modals
  const [showMedModal, setShowMedModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);

  // Charger le médecin connecté et vérifier si propriétaire
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

  // Charger les membres et le propriétaire (fix warning useEffect)
  useEffect(() => {
    const loadMembers = async () => {
      try {
        // Médecins
        const medPromises = (equipe.medecinsIds || []).map((id) =>
          api.get(`/api/medecins/${id}`).then((r) => r.data)
        );
        setMedecins(await Promise.all(medPromises));

        // Patients
        const patPromises = (equipe.patientsIds || []).map((id) =>
          api.get(`/api/patients/${id}`).then((r) => r.data)
        );
        setPatients(await Promise.all(patPromises));

        // Propriétaire
        if (equipe.medecinProprietaireId) {
          const propRes = await api.get(
            `/api/medecins/${equipe.medecinProprietaireId}`
          );
          setProprietaire(propRes.data);
        }
      } catch (err) {
        console.error("Erreur chargement membres équipe :", err);
      }
    };

    loadMembers();
  }, [equipe]); // plus de warning

  // Retirer un membre
  const handleRemove = async (type, id) => {
    if (!medecinConnecte) return;

    try {
      const url =
        type === "medecin"
          ? `/api/equipes/${equipe.id}/retirer-medecin?medecinId=${id}`
          : `/api/equipes/${equipe.id}/retirer-patient?patientId=${id}`;

      const headers =
        type === "medecin"
          ? { medecinProprietaireId: equipe.medecinProprietaireId }
          : { medecinId: medecinConnecte.id };

      await api.post(url, {}, { headers });

      if (type === "medecin")
        setMedecins((prev) => prev.filter((m) => m.id !== id));
      else setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Erreur suppression membre :", err);
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <article className="team-card shadow-sm">
      <div className="team-top d-flex justify-content-between align-items-start">
        <div>
          <h3 className="team-name">{equipe.nom}</h3>
          <small className="text-muted">
            Propriétaire :{" "}
            {proprietaire
              ? `Dr. ${proprietaire.prenom} ${proprietaire.nom}`
              : equipe.medecinProprietaireId}
          </small>
        </div>

        <div className="team-actions">
          <Button
            size="sm"
            variant="outline-primary"
            onClick={() => setExpanded((s) => !s)}
          >
            {expanded ? "Réduire" : "Détails"}
          </Button>

          {isOwner && (
            <>
              <Button
                size="sm"
                variant="outline-success"
                className="ms-2"
                onClick={onViewDetails}
              >
                Détails patients
              </Button>

              <Button
                size="sm"
                variant="outline-danger"
                className="ms-2"
                onClick={onDelete}
              >
                Supprimer l’équipe
              </Button>
            </>
          )}
        </div>
      </div>

      {expanded && (
        <div className="team-details mt-3">
          <div className="row">
            {/* Médecins */}
            <div className="col-md-6">
              <h5>Médecins ({medecins.length})</h5>

              {isOwner && (
                <Button
                  size="sm"
                  variant="success"
                  className="mb-2"
                  onClick={() => setShowMedModal(true)}
                >
                  + Ajouter un médecin
                </Button>
              )}

              <ul className="list-unstyled">
                {medecins.map((m) => (
                  <li
                    key={m.id}
                    className="mb-2 d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>
                        Dr. {m.prenom} {m.nom}
                      </strong>
                    </div>

                    <div>
                      {isOwner && m.id !== equipe.medecinProprietaireId && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleRemove("medecin", m.id)}
                        >
                          Retirer
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Patients */}
            <div className="col-md-6">
              <h5>Patients ({patients.length})</h5>

              {isOwner && (
                <Button
                  size="sm"
                  variant="success"
                  className="mb-2"
                  onClick={() => setShowPatientModal(true)}
                >
                  + Ajouter un patient
                </Button>
              )}

              <ul className="list-unstyled">
                {patients.map((p) => (
                  <li
                    key={p.id}
                    className="mb-2 d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>
                        {p.prenom} {p.nom}
                      </strong>
                    </div>

                    <div className="d-flex gap-2">
                      {medecinConnecte && (
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() =>
                            (window.location.href = `/patient/${p.id}/dossier`)
                          }
                        >
                          Dossier
                        </Button>
                      )}

                      {isOwner && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleRemove("patient", p.id)}
                        >
                          Retirer
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddMemberModal
        show={showMedModal}
        onHide={() => setShowMedModal(false)}
        type="medecin"
        equipeId={equipe.id}
        proprietaireId={equipe.medecinProprietaireId}
        existingIds={medecins.map((m) => m.id)}
        onAdded={(nouveauMed) => setMedecins((prev) => [...prev, nouveauMed])}
      />

      <AddMemberModal
        show={showPatientModal}
        onHide={() => setShowPatientModal(false)}
        type="patient"
        equipeId={equipe.id}
        proprietaireId={equipe.medecinProprietaireId}
        existingIds={patients.map((p) => p.id)}
        onAdded={(nouveauPat) => setPatients((prev) => [...prev, nouveauPat])}
      />
    </article>
  );
}
