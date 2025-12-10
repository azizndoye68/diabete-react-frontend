import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import SidebarMedecin from "../components/SidebarMedecin";
import DataTable from "react-data-table-component";
import { Button, Badge } from "react-bootstrap";
import { Bell, Mail, AlertTriangle } from "lucide-react";
import api from "../services/api";
import "./EquipeDetailsPage.css";

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

export default function EquipeDetailsPage() {
  const { equipeId } = useParams();
  const [medecin, setMedecin] = useState(null);
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  /** Charger profil médecin */
  const loadMedecinProfile = useCallback(async () => {
    try {
      const profileRes = await api.get("/api/auth/profile");
      const user = profileRes.data;
      const medRes = await api.get(`/api/medecins/byUtilisateur/${user.id}`);
      setMedecin(medRes.data);
    } catch (err) {
      console.error("Erreur chargement profil médecin :", err);
    }
  }, []);

  /** Charger patients de l'équipe */
  const loadPatients = useCallback(async () => {
    if (!equipeId || !medecin?.id) return;
    try {
      const res = await api.get(`/api/equipes/${equipeId}/patients`, {
        headers: { medecinId: medecin.id },
      });
      const patientsData = res.data;

      // Ajouter dernière glycémie
      const patientsComplete = await Promise.all(
        patientsData.map(async (p) => {
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
    } catch (err) {
      console.error("Erreur chargement patients équipe :", err);
    }
  }, [equipeId, medecin]);

  useEffect(() => { loadMedecinProfile(); }, [loadMedecinProfile]);
  useEffect(() => { loadPatients(); }, [loadPatients]);

  // 🔍 Filtrage par recherche
  useEffect(() => {
    let data = [...patients];
    if (search.trim()) {
      data = data.filter(
        (p) =>
          p.nom?.toLowerCase().includes(search.toLowerCase()) ||
          p.prenom?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(data);
  }, [search, patients]);

  const columns = [
    { name: "Nom", selector: (row) => row.nom, sortable: true },
    { name: "Prénom", selector: (row) => row.prenom, sortable: true },
    { name: "Type de diabète", selector: (row) => row.typeDiabete, sortable: true },
    {
      name: "Insuline",
      cell: (row) =>
        row.traitement?.toLowerCase().includes("insuline") ? (
          <Badge bg="success">Oui</Badge>
        ) : (
          <Badge bg="secondary">Non</Badge>
        ),
      sortable: true,
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
    <div className="medecin-layout">
      <SidebarMedecin user={medecin} />

      <main className="equipe-details-page p-3">
        <h2>Détails des patients de l'équipe</h2>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <input
            type="text"
            placeholder="Rechercher un patient..."
            className="form-control w-50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

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
      </main>
    </div>
  );
}
