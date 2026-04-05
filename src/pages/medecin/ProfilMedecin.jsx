// src/pages/medecin/ProfilMedecin.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Badge } from "react-bootstrap";
import TopbarMedecin from "../../components/TopbarMedecin";
import api from "../../services/api";
import "./ProfilMedecin.css";

function ProfilMedecin() {
  const [medecin, setMedecin] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    specialite: "",
    nomService: "",
    adresse: "",
    ville: "",
    region: "",
  });

  useEffect(() => {
    const fetchMedecin = async () => {
      try {
        const profileRes = await api.get("/api/auth/profile");
        const medRes = await api.get(`/api/medecins/byUtilisateur/${profileRes.data.id}`);
        const data = medRes.data;
        setMedecin(data);
        setFormData({
          nom: data.nom || "",
          prenom: data.prenom || "",
          telephone: data.telephone || "",
          specialite: data.specialite || "",
          nomService: data.nomService || "",
          adresse: data.adresse || "",
          ville: data.ville || "",
          region: data.region || "",
        });
      } catch (err) {
        console.error("Erreur chargement profil:", err);
        setErrorMsg("Impossible de charger le profil.");
      } finally {
        setLoading(false);
      }
    };
    fetchMedecin();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await api.put(`/api/medecins/${medecin.id}`, formData);
      setMedecin({ ...medecin, ...formData });
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
      nom: medecin.nom || "",
      prenom: medecin.prenom || "",
      telephone: medecin.telephone || "",
      specialite: medecin.specialite || "",
      nomService: medecin.nomService || "",
      adresse: medecin.adresse || "",
      ville: medecin.ville || "",
      region: medecin.region || "",
    });
    setEditMode(false);
    setErrorMsg("");
  };

  const getInitiales = () => {
    if (!medecin) return "?";
    return `${medecin.prenom?.[0] || ""}${medecin.nom?.[0] || ""}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="profil-medecin-wrapper">
        <TopbarMedecin user={medecin} />
        <div className="profil-loading">
          <div className="spinner-border text-success" role="status" />
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profil-medecin-wrapper">
      <TopbarMedecin user={medecin} />

      <div className="profil-medecin-content">
        <Container fluid className="px-4">

          {/* Messages */}
          {successMsg && (
            <div className="profil-alert profil-alert-success">
              <i className="bi bi-check-circle-fill me-2"></i>{successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="profil-alert profil-alert-error">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>{errorMsg}
            </div>
          )}

          <Row className="g-4">

            {/* ===== COLONNE GAUCHE : carte identité ===== */}
            <Col xl={4} lg={5}>

              {/* Carte avatar + infos fixes */}
              <Card className="profil-identity-card mb-4">
                <div className="profil-identity-header">
                  <div className="profil-avatar-circle">
                    {getInitiales()}
                  </div>
                  <div className="profil-identity-online"></div>
                </div>
                <Card.Body className="profil-identity-body">
                  <h4 className="profil-fullname">
                    Dr. {medecin?.prenom} {medecin?.nom}
                  </h4>
                  <p className="profil-specialite">
                    {medecin?.specialite || "Médecin généraliste"}
                  </p>
                  <Badge className="profil-status-badge">
                    <i className="bi bi-patch-check-fill me-1"></i>
                    Professionnel vérifié
                  </Badge>

                  <div className="profil-fixed-info mt-4">
                    <div className="profil-info-row">
                      <div className="profil-info-icon">
                        <i className="bi bi-shield-fill"></i>
                      </div>
                      <div>
                        <span className="profil-info-label">N° Professionnel</span>
                        <span className="profil-info-value">{medecin?.numeroProfessionnel}</span>
                      </div>
                    </div>

                    <div className="profil-info-row">
                      <div className="profil-info-icon">
                        <i className="bi bi-gender-ambiguous"></i>
                      </div>
                      <div>
                        <span className="profil-info-label">Sexe</span>
                        <span className="profil-info-value">
                          {medecin?.sexe === "MASCULIN" ? "Masculin" : medecin?.sexe === "FEMININ" ? "Féminin" : medecin?.sexe || "--"}
                        </span>
                      </div>
                    </div>

                    <div className="profil-info-row">
                      <div className="profil-info-icon">
                        <i className="bi bi-calendar3"></i>
                      </div>
                      <div>
                        <span className="profil-info-label">Date de naissance</span>
                        <span className="profil-info-value">
                          {medecin?.dateNaissance
                            ? new Date(medecin.dateNaissance).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
                            : "--"}
                        </span>
                      </div>
                    </div>

                    <div className="profil-info-row">
                      <div className="profil-info-icon">
                        <i className="bi bi-calendar-check"></i>
                      </div>
                      <div>
                        <span className="profil-info-label">Membre depuis</span>
                        <span className="profil-info-value">
                          {medecin?.dateEnregistrement
                            ? new Date(medecin.dateEnregistrement).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
                            : "--"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Info non modifiable */}
              <Card className="profil-readonly-card">
                <Card.Body className="p-4">
                  <h6 className="profil-section-title">
                    <i className="bi bi-lock-fill me-2"></i>
                    Informations non modifiables
                  </h6>
                  <p className="profil-readonly-note">
                    Ces informations sont gérées par l'administration de la plateforme.
                    Pour toute modification, contactez le support.
                  </p>
                  <div className="profil-readonly-list">
                    <div className="profil-readonly-item">
                      <span className="profil-readonly-label">Numéro professionnel</span>
                      <span className="profil-readonly-value">{medecin?.numeroProfessionnel}</span>
                    </div>
                    <div className="profil-readonly-item">
                      <span className="profil-readonly-label">Date de naissance</span>
                      <span className="profil-readonly-value">
                        {medecin?.dateNaissance
                          ? new Date(medecin.dateNaissance).toLocaleDateString("fr-FR")
                          : "--"}
                      </span>
                    </div>
                    <div className="profil-readonly-item">
                      <span className="profil-readonly-label">Sexe</span>
                      <span className="profil-readonly-value">{medecin?.sexe || "--"}</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* ===== COLONNE DROITE : formulaire ===== */}
            <Col xl={8} lg={7}>

              {/* En-tête section */}
              <div className="profil-form-header mb-4">
                <div>
                  <h4 className="profil-form-title">Informations professionnelles</h4>
                  <p className="profil-form-subtitle">
                    Gérez et mettez à jour vos informations de profil
                  </p>
                </div>
                {!editMode ? (
                  <button className="btn-edit-profil" onClick={() => setEditMode(true)}>
                    <i className="bi bi-pencil-fill me-2"></i>
                    Modifier
                  </button>
                ) : (
                  <div className="d-flex gap-2">
                    <button className="btn-cancel-profil" onClick={handleCancel}>
                      <i className="bi bi-x-lg me-2"></i>
                      Annuler
                    </button>
                    <button className="btn-save-profil" onClick={handleSave} disabled={saving}>
                      {saving
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement...</>
                        : <><i className="bi bi-check-lg me-2"></i>Enregistrer</>
                      }
                    </button>
                  </div>
                )}
              </div>

              {/* Bloc identité */}
              <Card className="profil-form-card mb-4">
                <Card.Body className="p-4">
                  <h6 className="profil-section-title mb-4">
                    <i className="bi bi-person-fill me-2"></i>
                    Identité
                  </h6>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-label">Prénom</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="prenom"
                            value={formData.prenom}
                            onChange={handleChange}
                            className="profil-input"
                            placeholder="Votre prénom"
                          />
                        ) : (
                          <div className="profil-display-value">{medecin?.prenom || "--"}</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-label">Nom</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            className="profil-input"
                            placeholder="Votre nom"
                          />
                        ) : (
                          <div className="profil-display-value">{medecin?.nom || "--"}</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-label">Téléphone</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleChange}
                            className="profil-input"
                            placeholder="+221 77 000 00 00"
                          />
                        ) : (
                          <div className="profil-display-value">
                            <i className="bi bi-telephone me-2 text-success"></i>
                            {medecin?.telephone || "--"}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Bloc professionnel */}
              <Card className="profil-form-card mb-4">
                <Card.Body className="p-4">
                  <h6 className="profil-section-title mb-4">
                    <i className="bi bi-briefcase-fill me-2"></i>
                    Informations professionnelles
                  </h6>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-label">Spécialité</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="specialite"
                            value={formData.specialite}
                            onChange={handleChange}
                            className="profil-input"
                            placeholder="Ex: Endocrinologie"
                          />
                        ) : (
                          <div className="profil-display-value">{medecin?.specialite || "--"}</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-label">Service / Unité</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="nomService"
                            value={formData.nomService}
                            onChange={handleChange}
                            className="profil-input"
                            placeholder="Ex: Service de diabétologie"
                          />
                        ) : (
                          <div className="profil-display-value">{medecin?.nomService || "--"}</div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Bloc localisation */}
              <Card className="profil-form-card">
                <Card.Body className="p-4">
                  <h6 className="profil-section-title mb-4">
                    <i className="bi bi-geo-alt-fill me-2"></i>
                    Localisation
                  </h6>
                  <Row className="g-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="profil-label">Adresse</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="adresse"
                            value={formData.adresse}
                            onChange={handleChange}
                            className="profil-input"
                            placeholder="Votre adresse"
                          />
                        ) : (
                          <div className="profil-display-value">
                            <i className="bi bi-house me-2 text-success"></i>
                            {medecin?.adresse || "--"}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-label">Ville</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="ville"
                            value={formData.ville}
                            onChange={handleChange}
                            className="profil-input"
                            placeholder="Ex: Dakar"
                          />
                        ) : (
                          <div className="profil-display-value">{medecin?.ville || "--"}</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="profil-label">Région</Form.Label>
                        {editMode ? (
                          <Form.Control
                            name="region"
                            value={formData.region}
                            onChange={handleChange}
                            className="profil-input"
                            placeholder="Ex: Dakar"
                          />
                        ) : (
                          <div className="profil-display-value">{medecin?.region || "--"}</div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Boutons en bas si mode édition */}
                  {editMode && (
                    <div className="profil-form-actions mt-4">
                      <button className="btn-cancel-profil" onClick={handleCancel}>
                        <i className="bi bi-x-lg me-2"></i>Annuler
                      </button>
                      <button className="btn-save-profil" onClick={handleSave} disabled={saving}>
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

export default ProfilMedecin;