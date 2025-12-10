import React, { useEffect, useState, useMemo } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import api from "../services/api";

export default function AddMemberModal({ show, onHide, type, equipeId, proprietaireId, onAdded, existingIds = [] }) {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const isMed = type === "medecin";

  // IDs stables pour filtrer la liste
  const stableIds = useMemo(() => existingIds, [existingIds]);

  useEffect(() => {
    if (!show) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(isMed ? "/api/medecins" : "/api/patients");
        const filteredList = (res.data || []).filter(item => !stableIds.includes(item.id));
        setList(filteredList);
      } catch (err) {
        console.error("Erreur chargement liste:", err);
        setList([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [show, isMed, stableIds]);

  const filtered = list.filter(item =>
    (item.prenom || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.nom || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.username || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (id) => {
    try {
      const url = isMed
        ? `/api/equipes/${equipeId}/ajouter-medecin?medecinId=${id}`
        : `/api/equipes/${equipeId}/ajouter-patient?patientId=${id}`;

      const headers = isMed
        ? { medecinProprietaireId: proprietaireId }
        : { medecinId: proprietaireId };

      await api.post(url, {}, { headers });

      // Récupérer le membre ajouté pour le renvoyer
      const res = await api.get(isMed ? `/api/medecins/${id}` : `/api/patients/${id}`);

      setList(prev => prev.filter(item => item.id !== id));

      if (onAdded) onAdded(res.data);
    } catch (err) {
      console.error("Erreur ajout membre :", err);
      alert(err?.response?.data?.message || "Impossible d'ajouter le membre.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{isMed ? "Ajouter un médecin" : "Ajouter un patient"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Control
            placeholder={`Rechercher ${isMed ? "médecin" : "patient"} (nom/prénom)`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Form.Group>

        {loading ? <div>Chargement...</div> : (
          <Table hover responsive>
            <thead>
              <tr>
                <th>Prénom</th>
                <th>Nom</th>
                {isMed && <th>Spécialité</th>}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td>{item.prenom}</td>
                  <td>{item.nom}</td>
                  {isMed && <td>{item.specialite || "—"}</td>}
                  <td>
                    <Button size="sm" variant="success" onClick={() => handleAdd(item.id)}>
                      Ajouter
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Fermer</Button>
      </Modal.Footer>
    </Modal>
  );
}
