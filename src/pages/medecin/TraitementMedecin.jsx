// src/pages/TraitementMedecin.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircleFill } from "react-bootstrap-icons";
import api from "../../services/api";
import SidebarPatient from "../../components/SidebarPatient";
import "./TraitementMedecin.css";

function TraitementMedecin() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    traitement: "NON", // Sous insuline par défaut
    antecedents: "",
    allergies: "",
    notesMedicales: "",
  });

  // 🔹 Chargement patient + dossier médical
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Patient
        const resPatient = await api.get(`/api/patients/${patientId}`);
        setPatient(resPatient.data);

        // Dossier médical
        try {
          const resDossier = await api.get(`/api/dossiers/patient/${patientId}`);
          setDossier(resDossier.data);
          setFormData({
            traitement: resDossier.data.traitement || "NON",
            antecedents: resDossier.data.antecedents || "",
            allergies: resDossier.data.allergies || "",
            notesMedicales: resDossier.data.notesMedicales || "",
          });
        } catch {
          setDossier(null);
        }
      } catch (error) {
        console.error("Erreur chargement dossier médical", error);
        alert("Impossible de charger le dossier médical");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (dossier?.id) {
        await api.put(`/api/dossiers/${dossier.id}`, { ...formData, patientId });
      } else {
        const res = await api.post("/api/dossiers", { ...formData, patientId });
        setDossier(res.data);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l’enregistrement du dossier ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  return (
    <Container fluid className="p-0">
      <Row className="g-0 vh-100">
        {/* Sidebar */}
        <Col xs={12} md={3} className="sidebar-col p-0">
          <SidebarPatient patient={patient} isMedecin />
        </Col>

        {/* Contenu principal */}
        <Col xs={12} md={9} className="main-col p-4 traitement-medecin-page">
          <div className="traitement-container">
            <h3 className="mb-4">
              💊 Traitement — {patient?.prenom} {patient?.nom}
            </h3>

            {success && (
              <Alert variant="success" className="success-alert">
                <CheckCircleFill size={22} />
                <div>
                  <strong>Dossier médical mis à jour</strong>
                  <div className="text-muted small">
                    Les informations thérapeutiques ont été enregistrées avec succès.
                  </div>
                </div>
              </Alert>
            )}

            <Card className="shadow-sm traitement-form-card">
              <Card.Body>
                <h5 className="text-success mb-3">
                  {dossier
                    ? "Modifier le traitement du patient"
                    : "Créer le dossier médical"}
                </h5>

                <Form onSubmit={handleSubmit}>
                  {/* Sous insuline */}
                  <Form.Group className="mb-3">
                    <Form.Label>Sous insuline</Form.Label>
                    <Form.Select
                      name="traitement"
                      value={formData.traitement}
                      onChange={handleChange}
                      required
                    >
                      <option value="NON">Non</option>
                      <option value="OUI">Oui</option>
                    </Form.Select>
                  </Form.Group>

                  {/* Antécédents */}
                  <Form.Group className="mb-3">
                    <Form.Label>Antécédents médicaux</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="antecedents"
                      value={formData.antecedents}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  {/* Allergies */}
                  <Form.Group className="mb-3">
                    <Form.Label>Allergies</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  {/* Notes */}
                  <Form.Group className="mb-4">
                    <Form.Label>Notes médicales</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="notesMedicales"
                      value={formData.notesMedicales}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <div className="d-flex gap-3">
                    <Button type="submit" variant="success" disabled={saving}>
                      {saving
                        ? "Enregistrement..."
                        : dossier
                        ? "Mettre à jour le traitement"
                        : "Enregistrer le dossier"}
                    </Button>

                    <Button
                      variant="outline-secondary"
                      onClick={() =>
                        navigate(`/medecin/patient/${patientId}/dashboard`)
                      }
                    >
                      🏠 Retour au dossier patient
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default TraitementMedecin;
