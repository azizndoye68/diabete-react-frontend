// src/pages/PatientsList.jsx
import React, { useEffect, useState } from "react";
import { Row, Col, Card, ListGroup, Badge, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import SidebarAdmin from "../components/SidebarAdmin";
import api from "../services/api";

function PatientsList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get("/api/admin/patients");
        setPatients(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des patients :", err);
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
    <div className="dashboard-admin d-flex">
      <SidebarAdmin />

      <div className="dashboard-content flex-grow-1 p-4" style={{ marginLeft: '250px' }}>
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
                          {p.prenom} {p.nom}{" "}
                          <Badge
                            bg={p.statut === "Alerte" ? "danger" : "success"}
                            className="ms-2"
                          >
                            {p.statut || "Actif"}
                          </Badge>
                        </span>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => navigate(`/admin/patient/${p.id}`)}
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

export default PatientsList;
