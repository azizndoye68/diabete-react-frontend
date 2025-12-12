// src/components/EquipePatientsTable.jsx
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

function EquipePatientsTable({ medecinId }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // Récupérer tous les patients
        const res = await api.get(`/api/patients`);
        const patientsData = res.data;

        // Filtrer uniquement les patients dont le médecin est référent
        const myPatients = patientsData.filter(p => p.medecinId === medecinId);

        // Ajouter la dernière glycémie pour chaque patient
        const patientsComplete = await Promise.all(
          myPatients.map(async (p) => {
            let derniereGlycemie = "--";

            try {
              const mesureRes = await api.get(`/api/suivis/last?patientId=${p.id}`);
              derniereGlycemie = mesureRes.data?.glycemie ?? "--";
            } catch {
              derniereGlycemie = "--";
            }

            return { ...p, derniereGlycemie };
          })
        );

        setPatients(patientsComplete);
        setFiltered(patientsComplete);
      } catch (error) {
        console.error("Erreur chargement patients :", error);
      }
    };

    fetchPatients();
  }, [medecinId]);

  // Recherche
  useEffect(() => {
    setFiltered(
      patients.filter(
        (p) =>
          p.nom?.toLowerCase().includes(search.toLowerCase()) ||
          p.prenom?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, patients]);

  const columns = [
    { name: "Nom", selector: (row) => row.nom, sortable: true },
    { name: "Prénom", selector: (row) => row.prenom, sortable: true },
    { name: "Type de diabète", selector: (row) => row.typeDiabete, sortable: true },
    {
      name: "Insuline",
      selector: (row) => (row.traitement?.toLowerCase().includes("insuline") ? "Oui" : "Non"),
      cell: (row) =>
        row.traitement?.toLowerCase().includes("insuline") ? (
          <Badge bg="success">Oui</Badge>
        ) : (
          <Badge bg="secondary">Non</Badge>
        ),
    },
    {
      name: "Dernière glycémie (g/l)",
      selector: (row) => row.derniereGlycemie ?? "--",
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
    {
      name: "Date d'inscription",
      selector: (row) => row.dateEnregistrement || "--",
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <Button
          size="sm"
          variant="outline-success"
          onClick={() => (window.location.href = `/patient/${row.id}`)}
        >
          Accéder au compte
        </Button>
      ),
    },
  ];

  return (
    <div className="patients-table p-3 bg-white rounded shadow-sm">
      <h5 className="mb-3">Mes patients suivis</h5>
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
        striped
        responsive
        noDataComponent="Aucun patient trouvé"
      />
    </div>
  );
}

export default EquipePatientsTable;
