import React, { useEffect, useState, useMemo } from "react";
import { Modal, Button, Form, Table, Spinner } from "react-bootstrap";
import * as medecinService from "../../services/medecinService";

export default function AddMemberModal({
  show,
  onHide,
  equipeId,
  proprietaireId,
  existingIds = [],
  onAdded, // callback qui reçoit le médecin ajouté
}) {
  const [medecins, setMedecins] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const excludedIds = useMemo(() => existingIds, [existingIds]);

  useEffect(() => {
    if (!show) return;

    const load = async () => {
      setLoading(true);
      try {
        const all = await medecinService.getAllMedecins();
        const disponibles = (all || []).filter(
          (m) => !excludedIds.includes(m.id)
        );
        setMedecins(disponibles);
      } catch (e) {
        console.error("Erreur chargement médecins :", e);
        setMedecins([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [show, excludedIds]);

  const filtered = medecins.filter((m) =>
    `${m.prenom} ${m.nom}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (medecinId) => {
    try {
      await medecinService.ajouterMedecinEquipe(
        equipeId,
        medecinId,
        proprietaireId
      );

      // Récupérer le médecin complet ajouté
      const nouveauMed = await medecinService.getMedecinById(medecinId);

      setMedecins((prev) => prev.filter((m) => m.id !== medecinId));

      if (onAdded) onAdded(nouveauMed); // transmettre le médecin ajouté
    } catch (err) {
      console.error("Erreur ajout médecin :", err);
      alert(err?.response?.data?.message || "Ajout impossible.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Ajouter un médecin à l’équipe</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Control
          className="mb-3"
          placeholder="Rechercher un médecin..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <div className="text-center py-3">
            <Spinner animation="border" variant="success" />
          </div>
        ) : (
          <Table hover responsive>
            <thead>
              <tr>
                <th>Prénom</th>
                <th>Nom</th>
                <th>Spécialité</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center">
                    Aucun médecin disponible
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id}>
                    <td>{m.prenom}</td>
                    <td>{m.nom}</td>
                    <td>{m.specialite || "—"}</td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleAdd(m.id)}
                      >
                        Ajouter
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
