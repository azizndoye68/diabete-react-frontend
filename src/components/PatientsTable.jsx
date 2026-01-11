import React, { useEffect, useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import { Button, Badge, Form, Card } from "react-bootstrap";
import {
  Bell,
  Mail,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import api from "../services/api";

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
        const res = await api.get(
          `/api/patients/medecin/${medecinId}/visibles`
        );
        const data = res.data || [];

        const enriched = await Promise.all(
          data.map(async (p) => {
            let derniereGlycemie = null;
            let medecinPrenom = null;
            let medecinNom = null;

            // 🔹 Dernière glycémie
            try {
              const mesureRes = await api.get(
                `/api/suivis/last?patientId=${p.id}`
              );
              derniereGlycemie = mesureRes.data?.glycemie ?? null;
            } catch {
              derniereGlycemie = null;
            }

            // 🔹 Médecin référent
            if (p.medecinId) {
              try {
                const medRes = await api.get(
                  `/api/medecins/${p.medecinId}`
                );
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
      minWidth: "120px"
    },
    {
      name: "Nom",
      selector: (r) => r.nom,
      sortable: true,
      minWidth: "120px"
    },
    {
      name: "Type diabète",
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
      cell: (r) =>
        r.derniereGlycemie !== null ? (
          <Badge bg={r.derniereGlycemie < 1 ? "warning" : "success"}>
            {r.derniereGlycemie}
          </Badge>
        ) : (
          <Badge bg="secondary">--</Badge>
        ),
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
      cell: (r) => (
        <div className="d-flex align-items-center gap-2">
          <Button
            size="sm"
            variant="outline-success"
            style={{ minWidth: "90px", whiteSpace: "nowrap" }}
            onClick={() => (window.location.href = `/patient/${r.id}`)}
          >
            Accéder
          </Button>
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() => toggleRow(r.id)}
          >
            {expandedRows[r.id] ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </Button>
        </div>
      ),
      minWidth: "160px"
    }
  ];

  /* ============================
     🔹 RENDER
  ============================= */
  return (
    <div className="p-3 bg-white rounded shadow-sm">
      <div className="d-flex justify-content-between mb-3 flex-wrap">
        <h5 className="mb-2">Patients suivis</h5>
        <Form.Check
          type="switch"
          label="Afficher uniquement mes patients"
          checked={filterReferent}
          onChange={(e) => setFilterReferent(e.target.checked)}
        />
      </div>

      <Form.Control
        className="mb-3"
        placeholder="Rechercher un patient..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

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
              <strong>Date d'inscription :</strong>{" "}
              {data.dateEnregistrement ?? "--"}
            </p>
            <p>
              <strong>Médecin référent :</strong>{" "}
              {data.medecinPrenom
                ? `${data.medecinPrenom} ${data.medecinNom}`
                : "Non référencé"}
            </p>
          </Card>
        )}
      />
    </div>
  );
}

export default PatientsTable;
