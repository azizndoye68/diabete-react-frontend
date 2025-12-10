import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Button, Badge } from "react-bootstrap";
import { Bell, Mail, AlertTriangle } from "lucide-react";
import api from "../services/api";
import { useNavigate } from "react-router-dom"; // ✅

const customStyles = {
  headCells: { style: { backgroundColor: "#e9f7ef", color: "#198754", fontWeight: "bold", fontSize: "14px" } },
  rows: { style: { minHeight: "55px" } },
};

function EquipePatientsTable({ equipeId }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const navigate = useNavigate(); // ✅

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await api.get(`/api/equipes/${equipeId}/patients`);
        const data = res.data;

        const patientsWithGly = await Promise.all(
          data.map(async (p) => {
            let derniereGlycemie = "--";
            try {
              const gly = await api.get(`/api/suivis/last?patientId=${p.id}`);
              derniereGlycemie = gly.data?.glycemie ?? "--";
            } catch {}
            return { ...p, derniereGlycemie };
          })
        );

        setPatients(patientsWithGly);
        setFiltered(patientsWithGly);
      } catch (err) {
        console.error("Erreur chargement patients equipe:", err);
      }
    };
    loadPatients();
  }, [equipeId]);

  useEffect(() => {
    setFiltered(
      patients.filter((p) =>
        (p.nom + " " + p.prenom).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, patients]);

  const columns = [
    { name: "Nom", selector: (row) => row.nom, sortable: true },
    { name: "Prénom", selector: (row) => row.prenom, sortable: true },
    { name: "Type diabète", selector: (row) => row.typeDiabete },

    {
      name: "Dernière glycémie",
      selector: (row) => row.derniereGlycemie,
      sortable: true,
      cell: (row) =>
        row.derniereGlycemie !== "--" ? (
          <Badge bg={row.derniereGlycemie < 1 ? "warning" : "success"}>
            {row.derniereGlycemie}
          </Badge>
        ) : (
          <Badge bg="secondary">--</Badge>
        ),
    },

    {
      name: "Notifications",
      cell: () => (
        <div>
          <Mail size={18} color="#198754" className="me-2" />
          <AlertTriangle size={18} color="#ffc107" className="me-2" />
          <Bell size={18} color="#dc3545" />
        </div>
      ),
    },

    { name: "Date ajout", selector: (row) => row.dateAjout || "--", sortable: true },

    {
      name: "Action",
      cell: (row) => (
        <Button
          variant="outline-success"
          size="sm"
          onClick={() => navigate(`/patient/${row.id}`)} // ✅ utilisation de useNavigate
        >
          Voir dossier
        </Button>
      ),
    },
  ];

  return (
    <div className="p-3 bg-white rounded shadow-sm">
      <h5 className="text-success mb-3">Patients de l'équipe</h5>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Rechercher un patient..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <DataTable
        columns={columns}
        data={filtered}
        customStyles={customStyles}
        pagination
        striped
        highlightOnHover
        responsive
        noDataComponent="Aucun patient dans l'équipe"
      />
    </div>
  );
}

export default EquipePatientsTable;
