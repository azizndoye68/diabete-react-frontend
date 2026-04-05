// src/pages/patient/ProfilPatient.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form } from "react-bootstrap";
import SidebarPatient from "../../components/SidebarPatient";
import api from "../../services/api";
import "./ProfilPatient.css";

function ProfilPatient() {
  const [patient, setPatient] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    adresse: "",
    ville: "",
    region: "",
  });

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const profileRes = await api.get("/api/auth/profile");
        const patientRes = await api.get(`/api/patients/byUtilisateur/${profileRes.data.id}`);
        const data = patientRes.data;
        setPatient(data);
        setFormData({
          nom: data.nom || "",
          prenom: data.prenom || "",
          telephone: data.telephone || "",
          adresse: data.adresse || "",
          ville: data.ville || "",
          region: data.region || "",
        });
      } catch (err) {
        console.error("Erreur chargement profil patient:", err);
        setErrorMsg("Impossible de charger le profil.");
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await api.put(`/api/patients/${patient.id}`, {
        ...formData,
        dateNaissance: patient.dateNaissance,
        sexe: patient.sexe,
        typeDiabete: patient.typeDiabete,
        utilisateurId: patient.utilisateurId,
      });
      setPatient({ ...patient, ...formData });
      setEditMode(false);
      setSuccessMsg("Profil mis à jour avec succès !");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Erreur mise à jour:", err);
      setErrorMsg("Erreur lors de la mise à jour. Vérifiez vos informations.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: patient.nom || "",
      prenom: patient.prenom || "",
      telephone: patient.telephone || "",
      adresse: patient.adresse || "",
      ville: patient.ville || "",
      region: patient.region || "",
    });
    setEditMode(false);
    setErrorMsg("");
  };

  const getInitiales = () => {
    if (!patient) return "?";
    return `${patient.prenom?.[0] || ""}${patient.nom?.[0] || ""}`.toUpperCase();
  };

  const formatTypeDiabete = (type) => {
    if (!type) return "--";
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (loading) {
    return (
      <div className="profil-patient-wrapper">
        <SidebarPatient patient={patient} />
        <div className="profil-patient-loading">
          <div className="spinner-border" role="status" />
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profil-patient-wrapper">
      <SidebarPatient patient={patient} />

      <div className="profil-patient-content">
        <Container fluid className="px-4">

          {/* Alertes */}
          {successMsg && (
            <div className="profil-pat-alert success">
              <i className="bi bi-check-circle-fill me-2"></i>{successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="profil-pat-alert error">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>{errorMsg}
            </div>
          )}

          <Row className="g-4">

            {/* ===== COLONNE GAUCHE ===== */}
            <Col xl={4} lg={5}>

              {/* Carte identité */}
              <Card className="profil-pat-identity-card mb-4">
                <div className="profil-pat-identity-header">
                  <div className="profil-pat-avatar">{getInitiales()}</div>
                  <div className="profil-pat-online"></div>
                </div>
                <Card.Body className="profil-pat-identity-body">
                  <h4 className="profil-pat-fullname">
                    {patient?.prenom} {patient?.nom}
                  </h4>
                  <p className="profil-pat-type">
                    {formatTypeDiabete(patient?.typeDiabete)}
                  </p>
                  <span className="profil-pat-badge">
                    <i className="bi bi-heart-pulse-fill me-1"></i>
                    Patient suivi
                  </span>

                  <div className="profil-pat-fixed-info mt-4">
                    <div className="profil-pat-info-row">
                      <div className="profil-pat-info-icon">
                        <i className="bi bi-folder2-fill"></i>
                      </div>
                      <div>
                        <span className="profil-pat-info-label">N° Dossier</span>
                        <span className="profil-pat-info-value">{patient?.numeroDossier}</span>
                      </div>
                    </div>

                    <div className="profil-pat-info-row">
                      <div className="profil-pat-info-icon">
                        <i className="bi bi-gender-ambiguous"></i>
                      </div>
                      <div>
                        <span className="profil-pat-info-label">Sexe</span>
                        <span className="profil-pat-info-value">
                          {patient?.sexe === "MASCULIN" ? "Masculin"
                            : patient?.sexe === "FEMININ" ? "Féminin"
                            : patient?.sexe || "--"}
                        </span>
                      </div>
                    </div>

                    <div className="profil-pat-info-row">
                      <div className="profil-pat-info-icon">
                        <i className="bi bi-calendar3"></i>
                      </div>
                      <div>
                        <span className="profil-pat-info-label">Date de naissance</span>
                        <span className="profil-pat-info-value">
                          {patient?.dateNaissance
                            ? new Date(patient.dateNaissance).toLocaleDateString("fr-FR", {
                                day: "2-digit", month: "long", year: "numeric",
                              })
                            : "--"}
                        </span>
                      </div>
                    </div>

                    <div className="profil-pat-info-row">
                      <div className="profil-pat-info-icon">
                        <i className="bi bi-droplet-half"></i>
                      </div>
                      <div>
                        <span className="profil-pat-info-label">Type de diabète</span>
                        <span className="profil-pat-info-value">
                          {formatTypeDiabete(patient?.typeDiabete)}
                        </span>
                      </div>
                    </div>

                    <div className="profil-pat-info-row">
                      <div className="profil-pat-info-icon">
                        <i className="bi bi-calendar-check"></i>
                      </div>
                      <div>
                        <span className="profil-pat-info-label">Inscrit le</span>
                        <span className="profil-pat-info-value">
                          {patient?.dateEnregistrement
                            ? new Date(patient.dateEnregistrement).toLocaleDateString("fr-FR", {
                                day: "2-digit", month: "long", year: "numeric",
                              })
                            : "--"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Carte infos non modifiables */}
              <Card className="profil-pat-readonly-card">
                <Card.Body className="p-4">
                  <h6 className="profil-pat-section-title">
                    <i className="bi bi-lock-fill me-2"></i>
                    Informations non modifiables
                  </h6>
                  <p className="profil-pat-readonly-note">
                    Ces informations sont gérées par votre équipe médicale.
                    Contactez votre médecin pour toute modification.
                  </p>
                  <div className="profil-pat-readonly-list">
                    <div className="profil-pat-readonly-item">
                      <span className="profil-pat-readonly-label">N° Dossier</span>
                      <span className="profil-pat-readonly-value">{patient?.numeroDossier}</span>
                    </div>
                    <div className="profil-pat-readonly-item">
                      <span className="profil-pat-readonly-label">Date de naissance</span>
                      <span className="profil-pat-readonly-value">
                        {patient?.dateNaissance
                          ? new Date(patient.dateNaissance).toLocaleDateString("fr-FR")
                          : "--"}
                      </span>
                    </div>
                    <div className="profil-pat-readonly-item">
                      <span className="profil-pat-readonly-label">Sexe</span>
                      <span className="profil-pat-readonly-value">{patient?.sexe || "--"}</span>
                    </div>
                    <div className="profil-pat-readonly-item">
                      <span className="profil-pat-readonly-label">Type de diabète</span>
                      <span className="profil-pat-readonly-value">
                        {formatTypeDiabete(patient?.typeDiabete)}
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* ===== COLONNE DROITE ===== */}
            <Col xl={8} lg={7}>

              {/* En-tête */}
              <div className="profil-pat-form-header mb-4">
                <div>
                  <h4 className="profil-pat-form-title">Mes informations personnelles</h4>
                  <p className="profil-pat-form-subtitle">
                    Consultez et mettez à jour vos coordonnées
                  </p>
                </div>
                {!editMode ? (
                  <button className="btn-edit-pat" onClick={() => setEditMode(true)}>
                    <i className="bi bi-pencil-fill me-2"></i>Modifier
                  </button>
                ) : (
                  <div className="d-flex gap-2 flex-wrap">
                    <button className="btn-cancel-pat" onClick={handleCancel}>
                      <i className="bi bi-x-lg me-2"></i>Annuler
                    </button>
                    <button className="btn-save-pat" onClick={handleSave} disabled={saving}>
                      {saving
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</>
                        : <><i className="bi bi-check-lg me-2"></i>Enregistrer</>
                      }
                    </button>
                  </div>
                )}
              </div>

              {/* Bloc identité */}
              <Card className="profil-pat-form-card mb-4">
                <Card.Body className="p-4">
                  <h6 className="profil-pat-section-title mb-4">
                    <i className="bi bi-person-fill me-2"></i>Identité
                  </h6>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-pat-label">Prénom</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="prenom"
                            value={formData.prenom}
                            onChange={handleChange}
                            className="profil-pat-input"
                            placeholder="Votre prénom"
                          />
                        ) : (
                          <div className="profil-pat-display">{patient?.prenom || "--"}</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-pat-label">Nom</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            className="profil-pat-input"
                            placeholder="Votre nom"
                          />
                        ) : (
                          <div className="profil-pat-display">{patient?.nom || "--"}</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-pat-label">Téléphone</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleChange}
                            className="profil-pat-input"
                            placeholder="+221 77 000 00 00"
                          />
                        ) : (
                          <div className="profil-pat-display">
                            <i className="bi bi-telephone me-2 text-success"></i>
                            {patient?.telephone || "--"}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Bloc localisation */}
              <Card className="profil-pat-form-card">
                <Card.Body className="p-4">
                  <h6 className="profil-pat-section-title mb-4">
                    <i className="bi bi-geo-alt-fill me-2"></i>Localisation
                  </h6>
                  <Row className="g-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="profil-pat-label">Adresse</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="adresse"
                            value={formData.adresse}
                            onChange={handleChange}
                            className="profil-pat-input"
                            placeholder="Votre adresse"
                          />
                        ) : (
                          <div className="profil-pat-display">
                            <i className="bi bi-house me-2 text-success"></i>
                            {patient?.adresse || "--"}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-pat-label">Ville</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="ville"
                            value={formData.ville}
                            onChange={handleChange}
                            className="profil-pat-input"
                            placeholder="Ex: Dakar"
                          />
                        ) : (
                          <div className="profil-pat-display">{patient?.ville || "--"}</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-pat-label">Région</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="region"
                            value={formData.region}
                            onChange={handleChange}
                            className="profil-pat-input"
                            placeholder="Ex: Dakar"
                          />
                        ) : (
                          <div className="profil-pat-display">{patient?.region || "--"}</div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {editMode && (
                    <div className="profil-pat-form-actions mt-4">
                      <button className="btn-cancel-pat" onClick={handleCancel}>
                        <i className="bi bi-x-lg me-2"></i>Annuler
                      </button>
                      <button className="btn-save-pat" onClick={handleSave} disabled={saving}>
                        {saving
                          ? <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</>
                          : <><i className="bi bi-check-lg me-2"></i>Enregistrer les modifications</>
                        }
                      </button>
                    </div>
                  )}
                </Card.Body>
              </Card>

            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default ProfilPatient;