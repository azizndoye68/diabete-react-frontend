// src/components/MedecinsAttente.jsx
import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Button } from "react-bootstrap";
import SidebarAdmin from "../components/SidebarAdmin";
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

function MedecinsAttente() {
  const [attente, setAttente] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAttente = async () => {
      try {
        const res = await api.get("/api/auth/users/pending/all");
        const usersData = res.data;

        const dataComplete = await Promise.all(
          usersData.map(async (user) => {
            let medecinInfo = null;
            try {
              const medRes = await api.get(`/api/medecins/byUtilisateur/${user.id}`);
              medecinInfo = medRes.data;
            } catch {
              medecinInfo = null;
            }
            return { ...user, medecinInfo };
          })
        );

        setAttente(dataComplete);
        setFiltered(dataComplete);
      } catch (err) {
        console.error("Erreur chargement médecins en attente :", err);
      }
    };

    fetchAttente();
  }, []);

  // 🔍 Filtrage par recherche
  useEffect(() => {
    let data = [...attente];
    if (search) {
      data = data.filter(
        (m) =>
          m.username.toLowerCase().includes(search.toLowerCase()) ||
          m.email.toLowerCase().includes(search.toLowerCase()) ||
          m.medecinInfo?.nom?.toLowerCase().includes(search.toLowerCase()) ||
          m.medecinInfo?.prenom?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(data);
  }, [search, attente]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/auth/approve/${id}`);
      setAttente(attente.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/api/auth/reject/${id}`);
      setAttente(attente.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { name: "Username", selector: (row) => row.username, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "Nom", selector: (row) => row.medecinInfo?.nom || "--", sortable: true },
    { name: "Prénom", selector: (row) => row.medecinInfo?.prenom || "--", sortable: true },
    { name: "Téléphone", selector: (row) => row.medecinInfo?.telephone || "--", sortable: true },
    { name: "Sexe", selector: (row) => row.medecinInfo?.sexe || "--", sortable: true },
    { name: "Spécialité", selector: (row) => row.medecinInfo?.specialite || "--", sortable: true },
    { name: "Adresse", selector: (row) => row.medecinInfo?.adresse || "--", sortable: true },
    { name: "Ville", selector: (row) => row.medecinInfo?.ville || "--", sortable: true },
    { name: "Région", selector: (row) => row.medecinInfo?.region || "--", sortable: true },
    { name: "Date d'inscription", selector: (row) => row.medecinInfo?.dateEnregistrement || "--", sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button size="sm" variant="success" onClick={() => handleApprove(row.id)}>
            Approuver
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleReject(row.id)}>
            Refuser
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="d-flex">
      <SidebarAdmin />
      <div
        className="p-3"
        style={{
          marginLeft: "250px",
          width: "calc(100% - 250px)",
        }}
      >
        <h3 className="mb-3">Médecins en attente</h3>

        {/* barre de recherche */}
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Rechercher un médecin..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Conteneur pour scroll horizontal */}
        <div style={{ overflowX: "auto" }}>
          <DataTable
            columns={columns}
            data={filtered}
            customStyles={customStyles}
            pagination
            highlightOnHover
            striped
            responsive
            noDataComponent="Aucun médecin en attente"
          />
        </div>
      </div>
    </div>
  );
}

export default MedecinsAttente;
