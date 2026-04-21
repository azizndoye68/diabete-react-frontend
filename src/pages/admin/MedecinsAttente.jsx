// src/pages/admin/MedecinsAttente.jsx
import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Badge, Button, Card, Form } from "react-bootstrap";
import SidebarAdmin from "../../components/SidebarAdmin";
import api from "../../services/api";

const customStyles = {
  table: {
    style: {
      backgroundColor: "white",
      borderRadius: "16px",
    },
  },
  headRow: {
    style: {
      background: "linear-gradient(135deg, #e9f7ef 0%, #ffffff 100%)",
      borderBottom: "2px solid #e9ecef",
      fontSize: "14px",
      fontWeight: "700",
      color: "#198754",
      minHeight: "60px",
      borderTopLeftRadius: "16px",
      borderTopRightRadius: "16px",
    },
  },
  headCells: {
    style: {
      paddingLeft: "20px",
      paddingRight: "20px",
      color: "#198754",
      fontWeight: "bold",
      fontSize: "14px",
    },
  },
  cells: {
    style: {
      paddingLeft: "20px",
      paddingRight: "20px",
    },
  },
  rows: {
    style: {
      minHeight: "65px",
      fontSize: "14px",
      "&:hover": {
        backgroundColor: "#f0fdf4",
        cursor: "pointer",
        transform: "scale(1.005)",
        boxShadow: "0 2px 8px rgba(25, 135, 84, 0.1)",
      },
      transition: "all 0.2s ease",
    },
  },
  pagination: {
    style: {
      borderTop: "2px solid #e9ecef",
      minHeight: "60px",
      borderBottomLeftRadius: "16px",
      borderBottomRightRadius: "16px",
    },
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
        const usersData = res.data.content;

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

  useEffect(() => {
    let data = [...attente];
    if (search) {
      data = data.filter(
        (m) =>
          m.username?.toLowerCase().includes(search.toLowerCase()) ||
          m.email?.toLowerCase().includes(search.toLowerCase()) ||
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
    {
      name: "Username",
      selector: (row) => row.username,
      sortable: true,
      minWidth: "130px",
      cell: (row) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <i className="bi bi-person-circle me-2 text-success" style={{ fontSize: "1.3rem" }}></i>
          <strong>{row.username}</strong>
        </div>
      ),
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      minWidth: "200px",
      cell: (row) => (
        <span className="text-muted small">
          <i className="bi bi-envelope me-1"></i>
          {row.email}
        </span>
      ),
    },
    {
      name: "Nom",
      selector: (row) => row.medecinInfo?.nom || "--",
      sortable: true,
      minWidth: "120px",
      cell: (row) => <strong>{row.medecinInfo?.nom || "--"}</strong>,
    },
    {
      name: "Prénom",
      selector: (row) => row.medecinInfo?.prenom || "--",
      sortable: true,
      minWidth: "120px",
      cell: (row) => <span>{row.medecinInfo?.prenom || "--"}</span>,
    },
    {
      name: "Spécialité",
      selector: (row) => row.medecinInfo?.specialite || "--",
      sortable: true,
      minWidth: "150px",
      cell: (row) =>
        row.medecinInfo?.specialite ? (
          <Badge
            style={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              padding: "0.5rem 0.875rem",
              fontWeight: "600",
              borderRadius: "10px",
              fontSize: "0.85rem",
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {row.medecinInfo.specialite}
          </Badge>
        ) : (
          <span className="text-muted">--</span>
        ),
    },
    {
      name: "Téléphone",
      selector: (row) => row.medecinInfo?.telephone || "--",
      minWidth: "140px",
      cell: (row) => (
        <span className="text-muted small">
          {row.medecinInfo?.telephone || "--"}
        </span>
      ),
    },
    {
      name: "Sexe",
      selector: (row) => row.medecinInfo?.sexe || "--",
      minWidth: "90px",
      cell: (row) => {
        const sexe = row.medecinInfo?.sexe;
        if (!sexe) return <span className="text-muted">--</span>;
        const isM = sexe.toUpperCase() === "M" || sexe.toUpperCase() === "MASCULIN";
        return (
          <Badge
            style={{
              background: isM
                ? "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              padding: "0.4rem 0.75rem",
              fontWeight: "600",
              borderRadius: "10px",
              fontSize: "0.8rem",
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {sexe}
          </Badge>
        );
      },
    },
    {
      name: "Ville",
      selector: (row) => row.medecinInfo?.ville || "--",
      minWidth: "110px",
      cell: (row) => (
        <span className="text-muted small">
          <i className="bi bi-geo-alt me-1"></i>
          {row.medecinInfo?.ville || "--"}
        </span>
      ),
    },
    {
      name: "Région",
      selector: (row) => row.medecinInfo?.region || "--",
      minWidth: "110px",
      cell: (row) => (
        <span className="text-muted small">{row.medecinInfo?.region || "--"}</span>
      ),
    },
    {
      name: "Date d'inscription",
      selector: (row) => row.medecinInfo?.dateEnregistrement || "--",
      sortable: true,
      minWidth: "160px",
      cell: (row) => (
        <span className="text-muted small">
          <i className="bi bi-calendar3 me-1"></i>
          {row.medecinInfo?.dateEnregistrement || "--"}
        </span>
      ),
    },
    {
      name: "Actions",
      minWidth: "180px",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button
            size="sm"
            onClick={() => handleApprove(row.id)}
            style={{
              borderRadius: "10px",
              padding: "0.4rem 1rem",
              fontWeight: "600",
              border: "none",
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              boxShadow: "0 3px 10px rgba(67, 233, 123, 0.3)",
              transition: "all 0.2s ease",
              color: "#fff",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <i className="bi bi-check-lg me-1"></i>
            Approuver
          </Button>
          <Button
            size="sm"
            onClick={() => handleReject(row.id)}
            style={{
              borderRadius: "10px",
              padding: "0.4rem 1rem",
              fontWeight: "600",
              border: "none",
              background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
              boxShadow: "0 3px 10px rgba(238, 90, 111, 0.3)",
              transition: "all 0.2s ease",
              color: "#fff",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <i className="bi bi-x-lg me-1"></i>
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
        style={{
          marginLeft: "250px",
          width: "calc(100% - 250px)",
          padding: "2rem",
          background: "#f8f9fa",
          minHeight: "100vh",
        }}
      >
        {/* En-tête */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h3 style={{ fontWeight: "700", color: "#2d3748", marginBottom: "0.25rem" }}>
              <i className="bi bi-hourglass-split me-2 text-success"></i>
              Médecins en attente
            </h3>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              Validez ou refusez les demandes d'inscription
            </p>
          </div>
          <Badge
            style={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              padding: "0.6rem 1.2rem",
              fontWeight: "600",
              borderRadius: "12px",
              fontSize: "0.95rem",
              boxShadow: "0 4px 15px rgba(67, 233, 123, 0.3)",
              color: "#fff",
            }}
          >
            <i className="bi bi-people-fill me-2"></i>
            {filtered.length} médecin{filtered.length > 1 ? "s" : ""}
          </Badge>
        </div>

        {/* Carte principale */}
        <Card
          style={{
            border: "none",
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            background: "white",
          }}
        >
          <Card.Body className="p-4">
            {/* Barre de recherche */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
                paddingBottom: "1.5rem",
                borderBottom: "2px solid #f1f3f5",
              }}
            >
              <span className="text-muted" style={{ fontSize: "0.9rem", fontWeight: "500" }}>
                <i className="bi bi-funnel me-1"></i>
                Filtrer les résultats
              </span>
              <Form.Control
                placeholder="Rechercher un médecin..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  maxWidth: "300px",
                  borderRadius: "10px",
                  border: "2px solid #e9ecef",
                  padding: "0.6rem 1rem",
                  transition: "all 0.3s ease",
                  fontSize: "0.9rem",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#43e97b";
                  e.target.style.boxShadow = "0 0 0 0.2rem rgba(67, 233, 123, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e9ecef";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Tableau */}
            <div style={{ overflowX: "auto" }}>
              <DataTable
                columns={columns}
                data={filtered}
                customStyles={customStyles}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[5, 10, 15, 20]}
                highlightOnHover
                striped
                responsive
                noDataComponent={
                  <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                    <i
                      className="bi bi-inbox"
                      style={{ fontSize: "4rem", color: "#e9ecef", display: "block" }}
                    ></i>
                    <p className="text-muted mt-3 mb-0">Aucun médecin en attente</p>
                  </div>
                }
              />
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default MedecinsAttente;