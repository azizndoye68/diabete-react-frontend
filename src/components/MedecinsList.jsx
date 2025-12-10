// src/pages/MedecinsList.jsx
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

function MedecinsList() {
  const [medecins, setMedecins] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get("/api/auth/profile");
        setAdmin(profileRes.data);

        const res = await api.get("/api/medecins");
        setMedecins(res.data);
        setFiltered(res.data);
      } catch (error) {
        console.error("Erreur chargement médecins :", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const data = medecins.filter(
      (m) =>
        m.nom?.toLowerCase().includes(search.toLowerCase()) ||
        m.prenom?.toLowerCase().includes(search.toLowerCase()) ||
        m.specialite?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(data);
  }, [search, medecins]);

  const columns = [
    { name: "Nom", selector: (row) => row.nom, sortable: true },
    { name: "Prénom", selector: (row) => row.prenom, sortable: true },
    { name: "Téléphone", selector: (row) => row.telephone, sortable: true },
    { name: "Spécialité", selector: (row) => row.specialite || "--", sortable: true },
    {
      name: "Sexe",
      selector: (row) => row.sexe || "--",
      sortable: true,
    },
    { name: "Date d'inscription", selector: (row) => row.dateEnregistrement || "--", sortable: true },
    {
      name: "Action",
      cell: (row) => (
        <Button
          size="sm"
          variant="outline-success"
          onClick={() => (window.location.href = `/medecin/${row.id}`)}
        >
          Accéder au compte
        </Button>
      ),
    },
  ];

  return (
    <div className="d-flex">
      <SidebarAdmin admin={admin} />
      <div
        className="p-3"
        style={{
          marginLeft: "250px",
          width: "100%",
          overflowX: "auto",
        }}
      >
        <h5 className="mb-3">Liste des Médecins</h5>

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Rechercher un médecin..."
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
          noDataComponent="Aucun médecin trouvé"
        />
      </div>
    </div>
  );
}

export default MedecinsList;
