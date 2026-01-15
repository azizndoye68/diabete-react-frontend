import React, { useEffect, useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import { Badge, Form, Card, Button } from "react-bootstrap";
import { Bell, Mail, AlertTriangle, Plus } from "lucide-react";
import api from "../../services/api";

function PatientsTable({ medecinId }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [filterReferent, setFilterReferent] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ============================
     🔹 CHARGEMENT DES PATIENTS
  ============================ */
  useEffect(() => {
    if (!medecinId) return;

    const fetchPatients = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/patients/medecin/${medecinId}/visibles`);
        const data = res.data || [];

        const enriched = await Promise.all(
          data.map(async (p) => {
            let derniereGlycemie = null;
            let medecinPrenom = null;
            let medecinNom = null;
            let traitement = null;
            let allergies = null;

            // 🔹 Dernière glycémie
            try {
              const mesureRes = await api.get(`/api/suivis/last?patientId=${p.id}`);
              derniereGlycemie = mesureRes.data?.glycemie ?? null;
            } catch {}

            // 🔹 Dossier médical
            try {
              const dossierRes = await api.get(`/api/dossiers/patient/${p.id}`);
              traitement = dossierRes.data?.traitement ?? null;
              allergies = dossierRes.data?.allergies ?? null;
            } catch {}

            // 🔹 Médecin référent
            if (p.medecinId) {
              try {
                const medRes = await api.get(`/api/medecins/${p.medecinId}`);
                medecinPrenom = medRes.data?.prenom ?? null;
                medecinNom = medRes.data?.nom ?? null;
              } catch {}
            }

            return {
              ...p,
              derniereGlycemie,
              medecinPrenom,
              medecinNom,
              traitement,
              allergies,
              source: p.medecinId === medecinId ? "DIRECT" : "EQUIPE",
            };
          })
        );

        setPatients(enriched);
      } catch (err) {
        console.error("Erreur chargement patients", err);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [medecinId]);

  /* ============================
     🔹 FILTRES
  ============================ */
  const filteredPatients = useMemo(() => {
    let data = [...patients];

    if (search) {
      data = data.filter(
        (p) =>
          p.nom?.toLowerCase().includes(search.toLowerCase()) ||
          p.prenom?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterReferent) {
      data = data.filter((p) => p.source === "DIRECT");
    }

    return data;
  }, [patients, search, filterReferent]);

  /* ============================
     🔹 COLONNES DU TABLEAU
  ============================ */
  const columns = [
    { name: "Prénom", selector: (r) => r.prenom, sortable: true, minWidth: "120px", wrap: true },
    { name: "Nom", selector: (r) => r.nom, sortable: true, minWidth: "120px", wrap: true },
    { name: "Type de diabète", selector: (r) => r.typeDiabete, minWidth: "130px" },
    {
      name: "Allergies",
      cell: (r) => <span>{r.allergies ?? "Aucune"}</span>,
      minWidth: "120px"
    },
    {
      name: "Sous insuline",
      cell: (r) => {
        const traitement = r.traitement?.toString().trim().toUpperCase();
        return (
          <Badge bg={traitement === "OUI" ? "success" : "secondary"}>
            {traitement === "OUI" ? "Oui" : "Non"}
          </Badge>
        );
      },
      minWidth: "110px",
    },
    {
      name: "Dernière mesure",
      cell: (r) => {
        if (r.derniereGlycemie === null) return <Badge bg="secondary">--</Badge>;

        let couleur = "";
        if (r.derniereGlycemie < 0.7) couleur = "danger";
        else if (r.derniereGlycemie <= 1.2) couleur = "success";
        else if (r.derniereGlycemie <= 1.4) couleur = "warning";
        else couleur = "danger";

        return (
          <Badge bg={couleur} style={{ textTransform: "none" }}>
            {r.derniereGlycemie} g/L
          </Badge>
        );
      },
      minWidth: "140px",
    },
    {
      name: "Notifications",
      cell: () => (
        <div className="d-flex gap-2">
          <Mail size={18} color="#198754" />
          <AlertTriangle size={18} color="#ffc107" />
          <Bell size={18} color="#dc3545" />
        </div>
      ),
      minWidth: "140px",
    },
  ];

  /* ============================
     🔹 STYLES DATA TABLE
  ============================ */
  const customStyles = {
    header: { style: { fontSize: "20px", fontWeight: "600", color: "#2f855a" } },
    headRow: {
      style: {
        backgroundColor: "#e6f4ea",
        fontSize: "14px",
        fontWeight: "600",
        color: "#2f855a",
        minHeight: "50px",
      },
    },
    rows: { style: { minHeight: "50px", fontSize: "14px" } },
    pagination: { style: { borderTop: "1px solid #dee2e6" } },
  };

  /* ============================
     🔹 RENDER
  ============================ */
  return (
    <div className="p-3 bg-white rounded shadow-sm">
      {/* Barre actions */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <Form.Check
          type="switch"
          label="Afficher uniquement mes patients"
          checked={filterReferent}
          onChange={(e) => setFilterReferent(e.target.checked)}
        />
        <div className="d-flex align-items-center gap-2">
          <Form.Control
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "220px" }}
          />
          <Button
            variant="success"
            onClick={() => (window.location.href = "/register/patient")}
          >
            <Plus size={16} className="me-1" />
            Nouveau patient
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredPatients}
        progressPending={loading}
        pagination
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15, 20]}
        highlightOnHover
        pointerOnHover
        responsive
        striped
        expandableRows
        expandOnRowClicked={false}
        onRowClicked={(row) =>
          (window.location.href = `/medecin/patient/${row.id}/dashboard`)
        }
        expandableRowsComponent={({ data }) => (
          <Card body className="mb-2">
            <p>
              <strong>Téléphone :</strong> {data.telephone ?? "--"}
            </p>
            <p>
              <strong>Adresse :</strong> {data.adresse ?? "--"}
            </p>
            <p>
              <strong>Ville :</strong> {data.ville ?? "--"}
            </p>
            <p>
              <strong>Région :</strong> {data.region ?? "--"}
            </p>
            <p>
              <strong>Date d'inscription :</strong> {data.dateEnregistrement ?? "--"}
            </p>
            <p>
              <strong>Médecin référent :</strong>{" "}
              {data.medecinPrenom ? `${data.medecinPrenom} ${data.medecinNom}` : "Non référencé"}
            </p>
          </Card>
        )}
        customStyles={customStyles}
      />
    </div>
  );
}

export default PatientsTable;
