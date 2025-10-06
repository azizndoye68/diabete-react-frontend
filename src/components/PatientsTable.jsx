import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Button, Badge } from "react-bootstrap";
import { Bell, Mail, AlertTriangle } from "lucide-react";
import api from "../services/api";

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
};

function PatientsTable({ medecinId }) {
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get(`/api/patients`);
        setPatients(res.data);
        setFiltered(res.data);
      } catch (error) {
        console.error("Erreur chargement patients :", error);
      }
    };
    fetchPatients();
  }, [medecinId]);

  // 🔍 Filtrage
  useEffect(() => {
    const filteredData = patients.filter(
      (p) =>
        p.nom.toLowerCase().includes(search.toLowerCase()) ||
        p.prenom.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(filteredData);
  }, [search, patients]);

  // 🧩 Colonnes du tableau
  const columns = [
    { name: "Nom", selector: (row) => row.nom, sortable: true },
    { name: "Prénom", selector: (row) => row.prenom, sortable: true },
    {
      name: "Date d'inscription",
      selector: (row) => row.dateInscription || "--",
      sortable: true,
    },
    {
      name: "Dernière connexion",
      selector: (row) => row.derniereConnexion || "--",
      sortable: true,
    },
    {
      name: "Insuline",
      selector: (row) => (row.traitement?.toLowerCase().includes("insuline") ? "Oui" : "Non"),
      sortable: true,
      cell: (row) =>
        row.traitement?.toLowerCase().includes("insuline") ? (
          <Badge bg="success">Oui</Badge>
        ) : (
          <Badge bg="secondary">Non</Badge>
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
    {
      name: "Action",
      cell: (row) => (
        <Button
          size="sm"
          variant="outline-success"
          onClick={() => window.location.href = `/patient/${row.id}`}
        >
          Accéder au compte
        </Button>
      ),
    },
  ];

  return (
    <div className="patients-table p-3 bg-white rounded shadow-sm">
      <h5 className="mb-3">Patients en cours de suivi</h5>

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
        highlightOnHover
        responsive
        striped
        noDataComponent="Aucun patient trouvé"
      />
    </div>
  );
}

export default PatientsTable;
