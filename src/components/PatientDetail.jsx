// src/pages/PatientDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SidebarMedecin from "../components/SidebarMedecin";
import api from "../services/api";
import { Spinner, Card } from "react-bootstrap";

function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await api.get(`/api/patients/${id}`);
        setPatient(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement du patient :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (loading) return <Spinner animation="border" />;

  if (!patient) return <p>Patient non trouvé</p>;

  return (
    <div className="d-flex">
      <SidebarMedecin user={null} />
      <div className="p-4 flex-grow-1">
        <h2>{patient.prenom} {patient.nom}</h2>
        <Card>
          <Card.Body>
            <p>Téléphone: {patient.telephone}</p>
            <p>Date de naissance: {patient.dateNaissance}</p>
            <p>Type de diabète: {patient.typeDiabete}</p>
            <p>Traitement: {patient.traitement}</p>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default PatientDetail;
