import React, { useEffect, useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import { Badge, Form, Card, Button, Modal, ListGroup } from "react-bootstrap";
import { Bell, MessageSquare, AlertTriangle, Plus } from "lucide-react";
import api from "../../services/api";

function PatientsTable({ medecinId }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [filterReferent, setFilterReferent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal pour afficher les notifications
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    patientNom: "",
    type: "",
    notifications: [],
  });

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

            // Compteurs de notifications POUR L'ÉQUIPE MÉDICALE
            let countAlertes = 0;
            let countInactivite = 0;
            let countMessages = 0;
            let notifications = [];

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

            // 🆕 Récupérer TOUTES les notifications MÉDICALES (pour toute l'équipe)
            try {
              const notifRes = await api.get(`/api/notification-history/patient/${p.id}`);
              const allNotifications = notifRes.data || [];

              // ✅ FILTRER : Garder TOUTES les notifications médicales
              // (Si le patient est visible par ce médecin, il fait partie de l'équipe)
              notifications = allNotifications
                .filter((n) => n.medecinId !== null) // ✅ Toutes les notifs médicales
                .sort((a, b) => new Date(b.dateEnvoi) - new Date(a.dateEnvoi)); // Plus récent en premier

              // ✅ Compter SEULEMENT les notifications NON LUES
              notifications
                .filter((notif) => notif.statut !== "LU")
                .forEach((notif) => {
                  if (
                    notif.typeAlerte === "HYPOGLYCEMIE_SEVERE" ||
                    notif.typeAlerte === "HYPERGLYCEMIE_SEVERE"
                  ) {
                    countAlertes++;
                  } else if (notif.typeAlerte === "INACTIVITE_PATIENT") {
                    countInactivite++;
                  }
                });
            } catch (err) {
              console.error("Erreur récupération notifications", err);
            }

            return {
              ...p,
              derniereGlycemie,
              medecinPrenom,
              medecinNom,
              traitement,
              allergies,
              source: p.medecinId === medecinId ? "DIRECT" : "EQUIPE",
              countAlertes,
              countInactivite,
              countMessages,
              notifications,
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
     🆕 MARQUER NOTIFICATIONS COMME LUES
  ============================ */
  const markNotificationsAsRead = async (notifications) => {
    try {
      await Promise.all(
        notifications
          .filter((n) => n.statut !== "LU")
          .map((n) => api.put(`/api/notification-history/${n.id}/read`))
      );
    } catch (err) {
      console.error("Erreur mise à jour notifications", err);
    }
  };

  /* ============================
     🆕 OUVRIR MODAL NOTIFICATIONS
  ============================ */
  const handleShowNotifications = async (patient, type) => {
    let filteredNotifications = [];
    let titre = "";

    // ✅ Toutes les notifications médicales (pour toute l'équipe)
    const medecinNotifications = patient.notifications.filter(
      (n) => n.medecinId !== null
    );

    if (type === "alerte") {
      filteredNotifications = medecinNotifications.filter(
        (n) =>
          n.typeAlerte === "HYPOGLYCEMIE_SEVERE" ||
          n.typeAlerte === "HYPERGLYCEMIE_SEVERE"
      );
      titre = "Alertes critiques";
    } else if (type === "inactivite") {
      filteredNotifications = medecinNotifications.filter(
        (n) => n.typeAlerte === "INACTIVITE_PATIENT"
      );
      titre = "Patients inactifs";
    } else if (type === "message") {
      // Pour futur chat-service
      filteredNotifications = [];
      titre = "Messages du patient";
    }

    // ✅ Marquer comme lues
    await markNotificationsAsRead(filteredNotifications);

    // ✅ Mettre à jour l'état local (réactivité UI immédiate)
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patient.id
          ? {
              ...p,
              notifications: p.notifications.map((n) =>
                filteredNotifications.some((fn) => fn.id === n.id)
                  ? { ...n, statut: "LU" }
                  : n
              ),
              countAlertes: type === "alerte" ? 0 : p.countAlertes,
              countInactivite: type === "inactivite" ? 0 : p.countInactivite,
              countMessages: type === "message" ? 0 : p.countMessages,
            }
          : p
      )
    );

    setModalData({
      patientNom: `${patient.prenom} ${patient.nom}`,
      type: titre,
      notifications: filteredNotifications,
    });

    setShowModal(true);
  };

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
    {
      name: "Prénom",
      selector: (r) => r.prenom,
      sortable: true,
      minWidth: "120px",
      wrap: true,
    },
    {
      name: "Nom",
      selector: (r) => r.nom,
      sortable: true,
      minWidth: "120px",
      wrap: true,
    },
    {
      name: "Type de diabète",
      selector: (r) => r.typeDiabete,
      minWidth: "130px",
    },
    {
      name: "Allergies",
      cell: (r) => <span>{r.allergies ?? "Aucune"}</span>,
      minWidth: "120px",
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
        if (r.derniereGlycemie === null)
          return <Badge bg="secondary">--</Badge>;

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
      cell: (r) => (
        <div className="d-flex gap-3 align-items-center">
          {/* 🔴 ALERTES CRITIQUES (Hypo/Hyper sévères) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleShowNotifications(r, "alerte");
            }}
            style={{
              cursor: "pointer",
              position: "relative",
            }}
            title="Alertes critiques"
          >
            <AlertTriangle
              size={22}
              color="#dc3545"
              style={{ opacity: r.countAlertes > 0 ? 1 : 0.3 }}
            />
            {r.countAlertes > 0 && (
              <Badge
                bg="danger"
                pill
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  fontSize: "10px",
                  minWidth: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {r.countAlertes}
              </Badge>
            )}
          </div>

          {/* 🟡 INACTIVITÉ (Patients sans mesure depuis X jours) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleShowNotifications(r, "inactivite");
            }}
            style={{
              cursor: "pointer",
              position: "relative",
            }}
            title="Patients inactifs"
          >
            <Bell
              size={22}
              color="#ffc107"
              style={{ opacity: r.countInactivite > 0 ? 1 : 0.3 }}
            />
            {r.countInactivite > 0 && (
              <Badge
                bg="warning"
                pill
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  fontSize: "10px",
                  minWidth: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#000",
                }}
              >
                {r.countInactivite}
              </Badge>
            )}
          </div>

          {/* 🔵 MESSAGES (Chat avec le patient - futur chat-service) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleShowNotifications(r, "message");
            }}
            style={{
              cursor: "pointer",
              position: "relative",
            }}
            title="Messages du patient"
          >
            <MessageSquare
              size={22}
              color="#0d6efd"
              style={{ opacity: r.countMessages > 0 ? 1 : 0.3 }}
            />
            {r.countMessages > 0 && (
              <Badge
                bg="primary"
                pill
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  fontSize: "10px",
                  minWidth: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {r.countMessages}
              </Badge>
            )}
          </div>
        </div>
      ),
      minWidth: "160px",
    },
  ];

  /* ============================
     🔹 STYLES DATA TABLE
  ============================ */
  const customStyles = {
    header: {
      style: { fontSize: "20px", fontWeight: "600", color: "#2f855a" },
    },
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
     🔹 FORMATER LA DATE
  ============================ */
  const formatDate = (dateString) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ============================
     🔹 BADGE TYPE ALERTE
  ============================ */
  const getBadgeType = (typeAlerte) => {
    switch (typeAlerte) {
      case "HYPOGLYCEMIE_SEVERE":
      case "HYPERGLYCEMIE_SEVERE":
        return "danger";
      case "INACTIVITE_PATIENT":
        return "warning";
      default:
        return "secondary";
    }
  };

  /* ============================
     🔹 RENDER
  ============================ */
  return (
    <>
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
          customStyles={customStyles}
        />
      </div>

      {/* MODAL POUR AFFICHER LES NOTIFICATIONS */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalData.type} - {modalData.patientNom}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "500px", overflowY: "auto" }}>
          {modalData.notifications.length === 0 ? (
            <p className="text-muted text-center">Aucune notification</p>
          ) : (
            <ListGroup variant="flush">
              {modalData.notifications.map((notif, idx) => (
                <ListGroup.Item key={idx} className="border-0 py-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Badge bg={getBadgeType(notif.typeAlerte)}>
                      {notif.typeAlerte?.replace(/_/g, " ")}
                    </Badge>
                    <small className="text-muted">
                      {formatDate(notif.dateEnvoi)}
                    </small>
                  </div>
                  <p className="mb-2" style={{ whiteSpace: "pre-wrap" }}>
                    {notif.message}
                  </p>
                  <div className="d-flex gap-2">
                    <Badge bg="light" text="dark">
                      {notif.canal}
                    </Badge>
                    <Badge bg={notif.statut === "ENVOYE" ? "success" : "danger"}>
                      {notif.statut}
                    </Badge>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default PatientsTable;