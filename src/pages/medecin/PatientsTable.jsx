import React, { useEffect, useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import { Button, Badge, Form, Card } from "react-bootstrap";
import {
  Bell,
  Mail,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Plus
} from "lucide-react";
import api from "../../services/api";

function PatientsTable({ medecinId }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [filterReferent, setFilterReferent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  /* ============================
     🔹 CHARGEMENT DES PATIENTS
  ============================= */
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

            // 🔹 Dernière glycémie
            try {
              const mesureRes = await api.get(`/api/suivis/last?patientId=${p.id}`);
              derniereGlycemie = mesureRes.data?.glycemie ?? null;
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
              source: p.medecinId === medecinId ? "DIRECT" : "EQUIPE"
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
  ============================= */
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

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  /* ============================
     🔹 COLONNES DU TABLEAU
  ============================= */
  const columns = [
    {
      name: "Prénom",
      selector: (r) => r.prenom,
      sortable: true,
      minWidth: "120px",
      wrap: true
    },
    {
      name: "Nom",
      selector: (r) => r.nom,
      sortable: true,
      minWidth: "120px",
      wrap: true
    },
    {
      name: "Type de diabète",
      selector: (r) => r.typeDiabete,
      minWidth: "130px"
    },
    {
      name: "Sous insuline",
      cell: (r) =>
        r.traitement?.toLowerCase().includes("insuline") ? (
          <Badge bg="success">Oui</Badge>
        ) : (
          <Badge bg="secondary">Non</Badge>
        ),
      minWidth: "110px"
    },
    {
  name: "Dernière mesure",
  cell: (r) => {
    if (r.derniereGlycemie === null) {
      return <Badge bg="secondary">--</Badge>;
    }

    // 🔹 Définir la couleur selon la valeur
    let couleur = "";
    if (r.derniereGlycemie < 0.7) {
      couleur = "danger"; // rouge clair
    } else if (r.derniereGlycemie >= 0.7 && r.derniereGlycemie <= 1.2) {
      couleur = "success"; // vert
    } else if (r.derniereGlycemie > 1.2 && r.derniereGlycemie <= 1.4) {
      couleur = "warning"; // jaune
    } else if (r.derniereGlycemie > 1.4) {
      couleur = "danger"; // rouge foncé
    }

    return (
      <Badge bg={couleur} style={{ textTransform: "none" }}>
        {r.derniereGlycemie} g/L
      </Badge>
    );
  },
  minWidth: "140px"
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
      minWidth: "140px"
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <Button
            size="sm"
            variant="outline-success"
            style={{ minWidth: "90px", whiteSpace: "nowrap" }}
            onClick={() => {
              window.location.href = `/medecin/patient/${row.id}/dashboard`;
            }}
          >
            Accéder
          </Button>

          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() => toggleRow(row.id)}
          >
            {expandedRows[row.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
      ),
      minWidth: "160px"
    }
  ];

  /* ============================
     🔹 CUSTOM STYLES DATA TABLE
  ============================= */
  const customStyles = {
    header: {
      style: {
        fontSize: "20px",
        fontWeight: "600",
        color: "#2f855a"
      }
    },
    headRow: {
      style: {
        backgroundColor: "#e6f4ea",
        fontSize: "14px",
        fontWeight: "600",
        color: "#2f855a",
        minHeight: "50px"
      }
    },
    rows: {
      style: {
        minHeight: "50px",
        fontSize: "14px"
      }
    },
    pagination: {
      style: {
        borderTop: "1px solid #dee2e6"
      }
    }
  };

  /* ============================
     🔹 RENDER
  ============================= */
  return (
    <div className="p-3 bg-white rounded shadow-sm">
      {/* 🔹 Barre actions */}
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
            onClick={() => {
              window.location.href = "/medecin/patient/nouveau";
            }}
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
        highlightOnHover
        responsive
        striped
        expandableRows
        expandOnRowClicked={false}
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
