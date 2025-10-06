// src/pages/PatientsMedecin.jsx
import React, { useEffect, useState } from "react";
import { Row, Col, Card, ListGroup, Badge, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // ✅ hook pour navigation
import SidebarMedecin from "../components/SidebarMedecin";
import api from "../services/api";

function PatientsMedecin() {
  const [patients, setPatients] = useState([]);
  const [medecin, setMedecin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ création du navigate

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // Récupérer le profil connecté
        const userRes = await api.get("/api/auth/profile");
        const userData = userRes.data;

        if (userData.role !== "MEDECIN") throw new Error("Accès refusé : non médecin");

        // Infos médecin
        const medRes = await api.get(`/api/medecins/byUtilisateur/${userData.id}`);
        setMedecin(medRes.data);

        // Patients
        const patientsRes = await api.get("/api/patients");
        setPatients(patientsRes.data);
      } catch (error) {
        console.error("Erreur lors du chargement des patients :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="success" />
        <p>Chargement des patients...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-medecin d-flex">
      <SidebarMedecin user={medecin} />

      <div className="dashboard-content flex-grow-1 p-4">
        <h2 className="mb-4">Liste des patients</h2>

        <Row>
          <Col md={12}>
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <ListGroup variant="flush">
                  {patients.length > 0 ? (
                    patients.map((p) => (
                      <ListGroup.Item
                        key={p.id}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <span>
                          {p.prenom} {p.nom} {" "}
                          <Badge
                            bg={p.statut === "Alerte" ? "danger" : "success"}
                            className="ms-2"
                          >
                            {p.statut}
                          </Badge>
                        </span>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => navigate(`/medecin/patient/${p.id}`)}
                        >
                          Accéder au compte
                        </button>
                      </ListGroup.Item>
                    ))
                  ) : (
                    <p>Aucun patient</p>
                  )}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default PatientsMedecin;
