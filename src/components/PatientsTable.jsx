import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Button, Badge, Form } from "react-bootstrap";
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
  const [filterReferent, setFilterReferent] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // 1️⃣ Récupérer tous les patients
        const res = await api.get(`/api/patients`);
        const patientsData = res.data;

        // 2️⃣ Ajouter la dernière glycémie et le médecin référent pour chaque patient
        const patientsComplete = await Promise.all(
          patientsData.map(async (p) => {
            let derniereGlycemie = "--";
            let medecinPrenom = null;
            let medecinNom = null;

            try {
              // Récupérer la dernière mesure de glycémie
              const mesureRes = await api.get(`/api/suivis/last?patientId=${p.id}`);
              derniereGlycemie = mesureRes.data?.glycemie ?? "--";
            } catch {
              derniereGlycemie = "--";
            }

            try {
              // Récupérer les infos du médecin référent si medecinId existe
              if (p.medecinId) {
                const medRes = await api.get(`/api/medecins/${p.medecinId}`);
                medecinPrenom = medRes.data?.prenom ?? null;
                medecinNom = medRes.data?.nom ?? null;
              }
            } catch {
              medecinPrenom = null;
              medecinNom = null;
            }

            return { ...p, derniereGlycemie, medecinPrenom, medecinNom };
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

  // 🔍 Filtrage par recherche + médecin référent
  useEffect(() => {
    let data = [...patients];

    // Recherche par nom ou prénom du patient
    data = data.filter(
      (p) =>
        p.nom?.toLowerCase().includes(search.toLowerCase()) ||
        p.prenom?.toLowerCase().includes(search.toLowerCase())
    );

    // Filtrer uniquement les patients du médecin connecté
    if (filterReferent && medecinId) {
      data = data.filter((p) => p.medecinId === medecinId);
    }

    setFiltered(data);
  }, [search, filterReferent, patients, medecinId]);

  // 🧩 Colonnes du tableau
  const columns = [
    { name: "Nom", selector: (row) => row.nom, sortable: true },
    { name: "Prénom", selector: (row) => row.prenom, sortable: true },
    { name: "Type de diabète", selector: (row) => row.typeDiabete, sortable: true },
    
     {
      name: "Insuline",
      selector: (row) =>
        row.traitement?.toLowerCase().includes("insuline") ? "Oui" : "Non",
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
      name: "Médecin référent",
      selector: (row) =>
        row.medecinPrenom && row.medecinNom
          ? `${row.medecinPrenom} ${row.medecinNom}`
          : "Non référencé",
      sortable: true,
      cell: (row) => (
        <span>
          {row.medecinPrenom && row.medecinNom ? (
            <Badge bg="success">
              {row.medecinPrenom} {row.medecinNom}
            </Badge>
          ) : (
            <Badge bg="secondary">Non référencé</Badge>
          )}
        </span>
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Patients en cours de suivi</h5>

        <Form.Check
          type="switch"
          id="filter-referent"
          label="Afficher uniquement mes patients"
          checked={filterReferent}
          onChange={(e) => setFilterReferent(e.target.checked)}
        />
      </div>

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
