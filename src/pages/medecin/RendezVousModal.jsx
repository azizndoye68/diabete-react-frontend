import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Toast, ToastContainer } from "react-bootstrap";
import moment from "moment";
import * as medecinService from "../../services/medecinService";

function RendezVousModal({ show, onHide, selectedDate, onSave, rdvData }) {
  const [formData, setFormData] = useState({
    motif: "",
    dateRdv: selectedDate ? moment(selectedDate).format("YYYY-MM-DDTHH:mm") : "",
    patientId: "",
  });
  const [patients, setPatients] = useState([]);
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Initialisation du formulaire
  useEffect(() => {
    if (rdvData) {
      setFormData({
        motif: rdvData.motif || "",
        dateRdv: rdvData.dateRdv
          ? moment(rdvData.dateRdv).format("YYYY-MM-DDTHH:mm")
          : "",
        patientId: rdvData.patientId || "",
      });
    } else if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        dateRdv: moment(selectedDate).format("YYYY-MM-DDTHH:mm"),
      }));
    }
    setErrors({});
  }, [selectedDate, rdvData]);

  // Charger les patients via medecinService
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await medecinService.getPatients();
        setPatients(data);
      } catch (err) {
        console.error("Erreur lors du chargement des patients :", err);
      }
    };
    fetchPatients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // efface l'erreur quand on tape
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.patientId) newErrors.patientId = "Veuillez sélectionner un patient.";
    if (!formData.motif.trim()) newErrors.motif = "Veuillez entrer un motif.";
    if (!formData.dateRdv) newErrors.dateRdv = "Veuillez choisir une date et heure.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      motif: formData.motif.trim(),
      dateRdv: moment(formData.dateRdv).toISOString(),
      patientId: formData.patientId,
    };

    try {
      setSubmitting(true);
      if (typeof onSave === "function") await onSave(payload);

      setToastMessage(`✅ Rendez-vous ${rdvData ? "modifié" : "ajouté"} avec succès !`);
      setShowToast(true);

      setTimeout(() => onHide(), 1000);
    } catch (err) {
      console.error("Erreur lors de l’enregistrement du rendez-vous :", err);
      setToastMessage("❌ Impossible d'ajouter/modifier le rendez-vous.");
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal show={!!show} onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>{rdvData ? "Modifier le rendez-vous" : "Planifier un rendez-vous"}</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit} noValidate>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Patient</Form.Label>
              <Form.Select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                isInvalid={!!errors.patientId}
              >
                <option value="">-- Sélectionner un patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.prenom} {p.nom}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.patientId}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Motif</Form.Label>
              <Form.Control
                type="text"
                name="motif"
                placeholder="Ex : Contrôle mensuel"
                value={formData.motif}
                onChange={handleChange}
                isInvalid={!!errors.motif}
              />
              <Form.Control.Feedback type="invalid">{errors.motif}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date et heure</Form.Label>
              <Form.Control
                type="datetime-local"
                name="dateRdv"
                value={formData.dateRdv}
                onChange={handleChange}
                isInvalid={!!errors.dateRdv}
              />
              <Form.Control.Feedback type="invalid">{errors.dateRdv}</Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={onHide} disabled={submitting}>
              Annuler
            </Button>
            <Button variant="success" type="submit" disabled={submitting}>
              {rdvData ? "Modifier" : "Enregistrer"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toastMessage.startsWith("✅") ? "success" : "danger"}
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
        >
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

export default RendezVousModal;
