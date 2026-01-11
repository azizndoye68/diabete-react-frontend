import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Button, Badge, Form, Spinner } from "react-bootstrap";
import * as medecinService from "../../services/medecinService";
import RendezVousModal from "./RendezVousModal";
import "./RendezVousTable.css";

const customStyles = {
  headCells: {
    style: {
      backgroundColor: "#e9f7ef",
      color: "#198754",
      fontWeight: "bold",
      fontSize: "14px",
    },
  },
  rows: {
    style: { minHeight: "55px" },
  },
  cells: {
    style: {
      wordBreak: "break-word",
    },
  },
};

function RendezVousTable({ medecinId }) {
  const [rendezVous, setRendezVous] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState(null);
  const [filter, setFilter] = useState("tous");

  // Charger les rendez-vous et patients
  useEffect(() => {
    const fetchData = async () => {
      if (!medecinId) return;
      try {
        setLoading(true);
        const patientsData = await medecinService.getPatients(medecinId);
        setPatients(patientsData);

        const rdvs = await medecinService.getRendezVousByMedecin(medecinId);
        const withPatientNames = rdvs.map((rdv) => {
          const patient = patientsData.find((p) => p.id === rdv.patientId);
          return {
            ...rdv,
            patientNom: patient ? `${patient.prenom} ${patient.nom}` : "Inconnu",
          };
        });

        withPatientNames.sort((a, b) => new Date(a.dateRdv) - new Date(b.dateRdv));
        setRendezVous(withPatientNames);
      } catch (err) {
        console.error("Erreur chargement rendez-vous :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [medecinId]);

  // Ajouter / modifier rendez-vous
  const handleSave = async (formData) => {
    try {
      if (selectedRdv) {
        const updated = await medecinService.updateRendezVous(selectedRdv.id, formData);
        setRendezVous((prev) =>
          prev.map((rdv) => (rdv.id === selectedRdv.id ? { ...rdv, ...updated } : rdv))
        );
      } else {
        const created = await medecinService.creerRendezVous({ ...formData, medecinId });
        const patient = patients.find((p) => p.id === created.patientId);
        setRendezVous((prev) => [
          ...prev,
          { ...created, patientNom: patient ? `${patient.prenom} ${patient.nom}` : "Inconnu" },
        ]);
      }
      setShowModal(false);
      setSelectedRdv(null);
    } catch (err) {
      console.error("Erreur sauvegarde rendez-vous :", err);
    }
  };

  const handleEdit = (rdv) => {
    setSelectedRdv(rdv);
    setShowModal(true);
  };

  const handleUpdateStatut = async (id, newStatut) => {
    try {
      const updated = await medecinService.updateStatutRendezVous(id, newStatut);
      setRendezVous((prev) =>
        prev.map((rdv) => (rdv.id === id ? { ...rdv, statut: updated.statut } : rdv))
      );
    } catch (err) {
      console.error("Erreur mise à jour statut :", err);
    }
  };

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

  // Filtrage par date
  const filteredRendezVous = rendezVous.filter((rdv) => {
    if (filter === "tous") return true;
    const rdvDate = new Date(rdv.dateRdv);
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
        return rdvDate.getMonth() === now.getMonth() && rdvDate.getFullYear() === now.getFullYear();
      case "prochainMois": {
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const endNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);
        return rdvDate >= nextMonth && rdvDate <= endNextMonth;
      }
      default:
        return true;
    }
  });

  // Colonnes DataTable
  const columns = [
    { name: "Patient", selector: (row) => row.patientNom, sortable: true, wrap: true },
    {
      name: "Date",
      selector: (row) => new Date(row.dateRdv).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Heure",
      selector: (row) =>
        new Date(row.dateRdv).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
    { name: "Motif", selector: (row) => row.motif || "--", sortable: true, wrap: true },
    {
      name: "Statut",
      cell: (row) => renderStatutBadge(row.statut),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1 flex-wrap">
          {row.statut === "PLANIFIE" && (
            <>
              <Button style={{ minWidth: "90px" }} size="sm" variant="primary" onClick={() => handleEdit(row)}>
                ✏️ Modifier
              </Button>
              <Button style={{ minWidth: "90px" }} size="sm" variant="success" onClick={() => handleUpdateStatut(row.id, "TERMINE")}>
                ✅ Terminer
              </Button>
              <Button style={{ minWidth: "90px" }} size="sm" variant="danger" onClick={() => handleUpdateStatut(row.id, "ANNULE")}>
                ❌ Annuler
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="rendezvous-table p-3 bg-white rounded shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Rendez-vous</h5>
        <Form.Select className="w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="jour">Aujourd'hui</option>
          <option value="semaine">Cette semaine</option>
          <option value="mois">Ce mois</option>
          <option value="prochainMois">Prochain mois</option>
          <option value="tous">Tous</option>
        </Form.Select>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="success" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredRendezVous}
          customStyles={customStyles}
          pagination
          highlightOnHover
          responsive
          striped
          noDataComponent="Aucun rendez-vous trouvé"
        />
      )}

      {showModal && (
        <RendezVousModal
          show={showModal}
          onHide={() => setShowModal(false)}
          selectedDate={selectedRdv ? new Date(selectedRdv.dateRdv) : new Date()}
          onSave={handleSave}
          rdvData={selectedRdv}
        />
      )}
    </div>
  );
}

export default RendezVousTable;
