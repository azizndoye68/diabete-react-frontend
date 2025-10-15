import React, { useEffect, useState, useCallback } from "react";
import { Table, Button, Badge, Spinner, Form } from "react-bootstrap";
import RendezVousService from "../services/rendezvousService";
import api from "../services/api";
import RendezVousModal from "./RendezVousModal";
import "../styles/RendezVousTable.css";

function RendezVousTable({ medecinId }) {
  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState(null);
  const [filter, setFilter] = useState("jour");

  // 🔹 Récupérer le nom complet du patient
  const fetchPatientNom = async (patientId) => {
    try {
      const res = await api.get(`/api/patients/${patientId}`);
      const patient = res.data;
      return `${patient.prenom} ${patient.nom}`;
    } catch (err) {
      console.warn(`Patient ${patientId} introuvable.`);
      return "Inconnu";
    }
  };

  // 🔹 Charger les rendez-vous du médecin
  const loadRendezVous = useCallback(async () => {
    try {
      setLoading(true);
      const data = await RendezVousService.getByMedecin(medecinId);

      const withPatientNames = await Promise.all(
        data.map(async (rdv) => {
          const patientNom = await fetchPatientNom(rdv.patientId);
          return { ...rdv, patientNom };
        })
      );

      withPatientNames.sort(
        (a, b) => new Date(a.dateRendezVous) - new Date(b.dateRendezVous)
      );

      setRendezVous(withPatientNames);
    } catch (err) {
      console.error("Erreur lors du chargement des rendez-vous :", err);
    } finally {
      setLoading(false);
    }
  }, [medecinId]);

  useEffect(() => {
    if (medecinId) loadRendezVous();
  }, [medecinId, loadRendezVous]);

  // 🔹 Mettre à jour le statut
  const handleUpdateStatut = async (id, newStatut) => {
    try {
      const updated = await RendezVousService.updateStatut(id, newStatut);
      setRendezVous((prev) =>
        prev.map((rdv) => (rdv.id === id ? { ...rdv, statut: updated.statut } : rdv))
      );
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut :", err);
    }
  };

  // 🔹 Ouvrir la modale pour modification
  const handleEdit = (rdv) => {
    setSelectedRdv(rdv);
    setShowModal(true);
  };

  // 🔹 Sauvegarder ajout ou modification
  const handleSave = async (formData) => {
    try {
      if (selectedRdv) {
        // ✅ Modifier le rendez-vous existant
        const updated = await RendezVousService.update(selectedRdv.id, {
          ...selectedRdv,
          ...formData,
        });

        // ✅ Mettre à jour directement le tableau sans recharger
        setRendezVous((prev) =>
          prev.map((rdv) =>
            rdv.id === selectedRdv.id
              ? {
                  ...rdv,
                  dateRendezVous: updated.dateRendezVous,
                  motif: updated.motif,
                  statut: updated.statut,
                }
              : rdv
          )
        );
      } else {
        // ➕ Créer un nouveau rendez-vous
        const created = await RendezVousService.create({
          ...formData,
          medecinId,
        });

        const patientNom = await fetchPatientNom(created.patientId);
        setRendezVous((prev) => [...prev, { ...created, patientNom }]);
      }

      setShowModal(false);
      setSelectedRdv(null);
    } catch (err) {
      console.error("Erreur lors de l’enregistrement du rendez-vous :", err);
    }
  };

  // 🔹 Badge du statut
  const renderStatutBadge = (statut) => {
    switch (statut) {
      case "PLANIFIE":
        return <Badge bg="warning">Planifié</Badge>;
      case "TERMINE":
        return <Badge bg="success">Terminé</Badge>;
      case "ANNULE":
        return <Badge bg="danger">Annulé</Badge>;
      default:
        return <Badge bg="secondary">{statut}</Badge>;
    }
  };

  // 🔹 Filtrer les rendez-vous
  const filteredRendezVous = rendezVous.filter((rdv) => {
    const rdvDate = new Date(rdv.dateRendezVous);
    const now = new Date();

    switch (filter) {
      case "jour":
        return rdvDate.toDateString() === now.toDateString();

      case "semaine": {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return rdvDate >= startOfWeek && rdvDate <= endOfWeek;
      }

      case "mois":
        return (
          rdvDate.getMonth() === now.getMonth() &&
          rdvDate.getFullYear() === now.getFullYear()
        );

      case "prochainMois": {
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const endNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);
        return rdvDate >= nextMonth && rdvDate <= endNextMonth;
      }

      default:
        return true;
    }
  });

  return (
    <div className="rendezvous-table-container">
      <h4 className="mb-4 text-success">📋 Liste des Rendez-vous</h4>

      {/* 🔹 Filtre */}
      <Form.Select
        className="mb-3 w-auto"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <option value="jour">Aujourd'hui</option>
        <option value="semaine">Cette semaine</option>
        <option value="mois">Ce mois</option>
        <option value="prochainMois">Prochain mois</option>
        <option value="tous">Tous</option>
      </Form.Select>

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="success" />
        </div>
      ) : filteredRendezVous.length === 0 ? (
        <p className="text-muted text-center">Aucun rendez-vous trouvé.</p>
      ) : (
        <Table bordered hover responsive className="text-center align-middle">
          <thead className="table-success">
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Heure</th>
              <th>Motif</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRendezVous.map((rdv) => {
              const dateObj = new Date(rdv.dateRendezVous);
              const dateStr = dateObj.toLocaleDateString();
              const timeStr = dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <tr key={rdv.id}>
                  <td>{rdv.patientNom}</td>
                  <td>{dateStr}</td>
                  <td>{timeStr}</td>
                  <td>{rdv.motif}</td>
                  <td>{renderStatutBadge(rdv.statut)}</td>
                  <td>
                    {rdv.statut === "PLANIFIE" && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(rdv)}
                        >
                          ✏️ Modifier
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => handleUpdateStatut(rdv.id, "TERMINE")}
                        >
                          ✅ Terminer
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleUpdateStatut(rdv.id, "ANNULE")}
                        >
                          ❌ Annuler
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      {/* 🔹 Modale */}
      {showModal && (
        <RendezVousModal
          show={showModal}
          onHide={() => setShowModal(false)}
          selectedDate={selectedRdv ? new Date(selectedRdv.dateRendezVous) : new Date()}
          onSave={handleSave}
          medecinId={medecinId}
          rdvData={selectedRdv}
        />
      )}
    </div>
  );
}

export default RendezVousTable;
