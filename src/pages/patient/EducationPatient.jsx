// src/pages/patient/EducationPatient.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import SidebarPatient from "../../components/SidebarPatient";
import { getContenus } from "../../services/patientService";
import api from "../../services/api";
import "./EducationPatient.css";

export default function EducationPatient() {
  const [contenus, setContenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);

  // 🔹 Charger les contenus
  useEffect(() => {
    const loadContenus = async () => {
      try {
        const data = await getContenus();
        setContenus(data);
      } catch (e) {
        console.error("Erreur chargement contenus :", e);
      } finally {
        setLoading(false);
      }
    };
    loadContenus();
  }, []);

  // 🔹 Charger le patient pour la sidebar
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const profileRes = await api.get("/api/auth/profile");
        const userData = profileRes.data;

        const patientRes = await api.get(`/api/patients/byUtilisateur/${userData.id}`);
        const patientData = patientRes.data;

        setPatient(patientData);
      } catch (e) {
        console.error("Erreur récupération patient :", e);
      }
    };
    fetchPatient();
  }, []);

  const getThumbnail = (c) => {
    if (c.type === "VIDEO") {
      // Assumes YouTube URL, adapt if autre plateforme
      const videoId = c.url.split("v=")[1]?.split("&")[0];
      return videoId
        ? `https://img.youtube.com/vi/${videoId}/0.jpg`
        : "/images/video-placeholder.png";
    } else if (c.type === "PDF") {
      return "/images/pdf-thumbnail.png";
    } else if (c.type === "ARTICLE") {
      return "/images/article-thumbnail.png";
    } else {
      return "/images/default-placeholder.png";
    }
  };

  return (
    <Container fluid className="p-0">
      <Row className="g-0 vh-100">
        {/* Sidebar */}
        <Col xs={12} md={3} className="p-0">
          <SidebarPatient patient={patient} />
        </Col>

        {/* Contenu principal */}
        <Col xs={12} md={9} className="main-col p-4 overflow-auto">
          <div className="education-patient">
            <h2>📚 Éducation & sensibilisation</h2>
            <p className="subtitle">
              Apprenez à mieux gérer votre diabète grâce à ces contenus
            </p>

            {loading ? (
              <p>Chargement des contenus...</p>
            ) : contenus.length === 0 ? (
              <p>Aucun contenu disponible pour le moment</p>
            ) : (
              <div className="grid">
                {contenus.map((c) => (
                  <div key={c.id} className="content-card shadow-sm">
                    {/* Thumbnail */}
                    <div className="card-thumbnail">
                      <img src={getThumbnail(c)} alt={c.titre} />
                      {c.type === "VIDEO" && (
                        <div className="video-overlay">▶</div>
                      )}
                    </div>

                    {/* Titre et badge */}
                    <div className="card-header d-flex justify-content-between align-items-center mt-2">
                      <h5 className="mb-0">{c.titre}</h5>
                      <span className={`badge ${c.type.toLowerCase()}`}>
                        {c.type}
                      </span>
                    </div>

                    {/* Date et bouton */}
                    <div className="card-footer mt-2 d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        📅 {new Date(c.datePublication).toLocaleDateString("fr-FR")}
                      </small>
                      <Button
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        variant="outline-success"
                        size="sm"
                      >
                        Consulter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}
