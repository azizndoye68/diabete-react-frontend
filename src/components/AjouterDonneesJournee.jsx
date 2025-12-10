// src/pages/AjouterDonneeJournee.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import SidebarPatient from '../components/SidebarPatient';
import { useNavigate } from 'react-router-dom';
import { CheckCircleFill } from 'react-bootstrap-icons';
import './AjouterDonneeJournee.css';

function AjouterDonneeJournee() {
  const [donnees, setDonnees] = useState({
    glycemie: '',
    moment: '',
    repas: '',
    insuline: '',
    activite: '',
    symptome: '',
  });
  const [success, setSuccess] = useState(false);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const now = new Date();
  const dateString = now.toLocaleDateString('fr-FR');
  const timeString = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const profileRes = await api.get('/api/auth/profile');
        const utilisateurId = profileRes.data.id;

        const patientRes = await api.get(`/api/patients/byUtilisateur/${utilisateurId}`);
        setPatient(patientRes.data);
      } catch (error) {
        console.error('Erreur lors de la récupération du patient', error);
      }
    };
    fetchPatient();
  }, []);

  const handleChange = (e) => {
    setDonnees({ ...donnees, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patient) return alert('Erreur : patient non identifié.');

    const payload = {
      ...donnees,
      dateSuivi: new Date().toISOString(),
      patientId: patient.id,
    };

    try {
      setLoading(true);
      await api.post('/api/suivis', payload);
      setLoading(false);
      setSuccess(true);

      setDonnees({
        glycemie: '',
        moment: '',
        repas: '',
        insuline: '',
        activite: '',
        symptome: '',
      });
    } catch (error) {
      setLoading(false);
      alert("Erreur lors de l'enregistrement ❌");
      console.error('Erreur:', error);
    }
  };

  const SuccessScreen = () => (
    <Card className="p-5 text-center shadow-sm success-card">
      <CheckCircleFill size={80} className="text-success mb-3" />
      <h4 className="fw-bold text-success">Données enregistrées avec succès !</h4>
      <p className="text-muted mt-2 mb-4">
        Votre mesure de glycémie a bien été sauvegardée le {dateString} à {timeString}.
      </p>
      <div className="d-flex justify-content-center gap-3">
        <Button variant="outline-success" onClick={() => setSuccess(false)}>
          ➕ Ajouter une autre mesure
        </Button>
        <Button variant="success" onClick={() => navigate('/dashboard-patient')}>
          🏠 Retour au tableau de bord
        </Button>
      </div>
    </Card>
  );

  return (
    <Container fluid className="p-0">
      <Row className="g-0 vh-100">
        {/* Colonne Sidebar */}
        <Col xs={12} md={3} className="sidebar-col p-0">
          <SidebarPatient patient={patient} />
        </Col>

        {/* Colonne principale */}
        <Col xs={12} md={9} className="main-col d-flex justify-content-center align-items-start">
          <div className="form-center-wrapper w-100">
            <div className="form-card-container">
              {!success ? (
                <Card className="p-4 shadow-sm form-card">
                  <h4 className="mb-3 text-success text-center">Ajouter les données de la journée</h4>
                  <div className="text-center text-muted mb-3">
                    <strong>Date :</strong> {dateString} — <strong>Heure :</strong> {timeString}
                  </div>

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Taux de glycémie (g/L)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.1"
                        min="0.0"
                        max="5"
                        name="glycemie"
                        value={donnees.glycemie}
                        onChange={handleChange}
                        required
                        placeholder="Entrez votre taux de glycémie"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Moment de la prise</Form.Label>
                      <Form.Select name="moment" value={donnees.moment} onChange={handleChange} required>
                        <option value="">-- Sélectionner --</option>
                        <option value="avant_repas">Avant repas</option>
                        <option value="apres_repas">Après repas</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Repas</Form.Label>
                      <Form.Select name="repas" value={donnees.repas} onChange={handleChange}>
                        <option value="">-- Sélectionner --</option>
                        <option value="petit_dejeuner">Petit déjeuner</option>
                        <option value="dejeuner">Déjeuner</option>
                        <option value="diner">Dîner</option>
                      </Form.Select>
                    </Form.Group>

                    <Button variant="success" type="submit" className="w-100" disabled={loading}>
                      {loading ? 'Enregistrement...' : 'Enregistrer mes données'}
                    </Button>
                  </Form>
                </Card>
              ) : (
                <SuccessScreen />
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default AjouterDonneeJournee;
