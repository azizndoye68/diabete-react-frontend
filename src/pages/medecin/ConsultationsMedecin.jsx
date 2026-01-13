// src/pages/Consultations.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Table, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircleFill } from "react-bootstrap-icons";
import api from "../../services/api";
import SidebarPatient from "../../components/SidebarPatient";
import "./ConsultationsMedecin.css";

function Consultations() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [medecinId, setMedecinId] = useState(null);
  const [success, setSuccess] = useState(false);
  const [lastConsultDate, setLastConsultDate] = useState(null);

  const [formData, setFormData] = useState({
    motif: "",
    diagnostic: "",
    prescription: "",
  });

  // 🔹 Récupération du médecin via utilisateur, patient et consultations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingPatient(true);

        // Profil utilisateur connecté
        const profileRes = await api.get("/api/auth/profile");
        const utilisateurId = profileRes.data.id;

        // Médecin lié à cet utilisateur
        const medRes = await api.get(`/api/medecins/byUtilisateur/${utilisateurId}`);
        if (!medRes.data || !medRes.data.id) {
          throw new Error("Médecin introuvable pour l'utilisateur connecté !");
        }
        setMedecinId(medRes.data.id);

        // Patient sélectionné
        if (!patientId) throw new Error("Patient ID manquant dans l'URL !");
        const resPatient = await api.get(`/api/patients/${patientId}`);
        setPatient(resPatient.data);

        // Consultations
        const resConsult = await api.get(`/api/consultations/patient/${patientId}`);
        const sortedConsults = resConsult.data.sort(
          (a, b) => new Date(b.dateConsultation) - new Date(a.dateConsultation)
        );
        setConsultations(sortedConsults);

      } catch (error) {
        console.error("Erreur récupération patient / consultations / médecin", error);
        alert(error.message || "Impossible de récupérer les données.");
      } finally {
        setLoadingPatient(false);
      }
    };

    fetchData();
  }, [patientId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientId || !medecinId) {
      return alert("Impossible d'enregistrer : patient ou médecin non défini");
    }

    try {
      setLoading(true);

      const res = await api.post("/api/consultations", {
        ...formData,
        patientId: patientId,
        medecinId: medecinId,
      });

      setLastConsultDate(new Date(res.data.dateConsultation));
      setSuccess(true);

      setFormData({ motif: "", diagnostic: "", prescription: "" });

      // Rafraîchir l'historique
      const resConsult = await api.get(`/api/consultations/patient/${patientId}`);
      const sortedConsults = resConsult.data.sort(
        (a, b) => new Date(b.dateConsultation) - new Date(a.dateConsultation)
      );
      setConsultations(sortedConsults);

    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      alert("Erreur lors de l’enregistrement ❌");
    } finally {
      setLoading(false);
    }
  };

  if (loadingPatient) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  // ✅ Composant pour afficher le succès
  const SuccessScreen = () => (
    <Card className="p-5 text-center shadow-sm success-card">
      <CheckCircleFill size={80} className="text-success mb-3" />
      <h4 className="fw-bold text-success">Consultation enregistrée avec succès !</h4>
      <p className="text-muted mt-2 mb-4">
        La consultation a été ajoutée le{" "}
        {lastConsultDate?.toLocaleDateString("fr-FR")} à{" "}
        {lastConsultDate?.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}.
      </p>
      <div className="d-flex justify-content-center gap-3">
        <Button variant="outline-success" onClick={() => setSuccess(false)}>
          ➕ Ajouter une autre consultation
        </Button>
        <Button
          variant="success"
          onClick={() => navigate(`/medecin/patient/${patientId}/dashboard`)}
        >
          🏠 Retour au dossier patient
        </Button>
      </div>
    </Card>
  );

  return (
    <Container fluid className="p-0">
      <Row className="g-0 vh-100">
        <Col xs={12} md={3} className="sidebar-col p-0">
          <SidebarPatient patient={patient} isMedecin={true} />
        </Col>

        <Col xs={12} md={9} className="main-col d-flex flex-column p-4">
          <h3 className="mb-4">
            🩺 Consultations — {patient?.prenom} {patient?.nom}
          </h3>

          {!success ? (
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <h5 className="text-success mb-3">Nouvelle consultation</h5>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Motif</Form.Label>
                    <Form.Control
                      type="text"
                      name="motif"
                      value={formData.motif}
                      onChange={handleChange}
                      placeholder="Ex: Suivi diabète, contrôle glycémie..."
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Diagnostic</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="diagnostic"
                      value={formData.diagnostic}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Prescription / recommandations</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="prescription"
                      value={formData.prescription}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <div className="d-flex gap-3">
                    <Button type="submit" variant="success" disabled={loading}>
                      {loading ? "Enregistrement..." : "Enregistrer la consultation"}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => navigate(`/medecin/patient/${patientId}/dashboard`)}
                    >
                      🏠 Retour au dossier patient
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          ) : (
            <SuccessScreen />
          )}

          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Historique des consultations</h5>
              <Table responsive hover className="align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Motif</th>
                    <th>Diagnostic</th>
                    <th>Prescription</th>
                  </tr>
                </thead>
                <tbody>
                  {consultations.length > 0 ? (
                    consultations.map((c) => (
                      <tr key={c.id}>
                        <td>{new Date(c.dateConsultation).toLocaleString()}</td>
                        <td>{c.motif || "-"}</td>
                        <td>{c.diagnostic || "-"}</td>
                        <td>{c.prescription || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center text-muted">
                        Aucune consultation enregistrée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Consultations;
