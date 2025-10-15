// src/pages/AjouterDonneeJournee.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Container, Form, Button, Card, Row } from 'react-bootstrap';
import SidebarPatient from '../components/SidebarPatient';
import './AjouterDonneeJournee.css';

function AjouterDonneeJournee() {
  const [donnees, setDonnees] = useState({
    glycemie: '',
    moment: '',
    repas: '',
    insuline: '',
    activite: '',
    symptome: ''
  });

  const [message, setMessage] = useState('');
  const [patient, setPatient] = useState(null);

  const now = new Date();
  const dateString = now.toLocaleDateString('fr-FR');
  const timeString = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // 🔹 Récupère le patient lié à l'utilisateur connecté
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const profileRes = await api.get('/api/auth/profile'); // retourne l'utilisateur
        const utilisateurId = profileRes.data.id;

        const patientRes = await api.get(`/api/patients/byUtilisateur/${utilisateurId}`);
        setPatient(patientRes.data);
      } catch (error) {
        console.error("Erreur lors de la récupération du patient", error);
      }
    };
    fetchPatient();
  }, []);

  const handleChange = (e) => {
    setDonnees({ ...donnees, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patient) {
      setMessage("Erreur : patient non identifié.");
      return;
    }

    const payload = {
      ...donnees,
      dateSuivi: new Date().toISOString(),
      patientId: patient.id // ✅ Utilise le patient correct
    };

    try {
      const response = await api.post('/api/suivis', payload);
      console.log('Enregistrement réussi', response.data);
      setMessage('Données enregistrées avec succès ✅');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement', error);
      setMessage('Erreur lors de l\'enregistrement ❌');
    }
  };

  return (
    <Row className="m-0 vh-100">
      <SidebarPatient patient={patient} />
      <div className="form-wrapper d-flex justify-content-center">
        <Container className="mt-5" style={{ maxWidth: '700px' }}>
          <Card className="p-4 shadow-sm">
            <h4 className="mb-4 text-success text-center">Ajouter les données de la journée</h4>
            <div className="text-center text-muted mb-4">
              <strong>Date :</strong> {dateString} — <strong>Heure :</strong> {timeString}
            </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Taux de glycémie (g/l)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  min="0.0"
                  max="5"
                  name="glycemie"
                  value={donnees.glycemie}
                  onChange={handleChange}
                  required
                  placeholder="Entrez le taux de glycémie"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Moment de la prise</Form.Label>
                <Form.Select name="moment" value={donnees.moment} onChange={handleChange} required>
                  <option value="">-- Sélectionner --</option>
                  <option value="avant_repas">Avant repas</option>
                  <option value="apres_repas">Après repas</option>
                  <option value="à jeun">À jeun</option>
                  <option value="autre">Autre</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Repas</Form.Label>
                <Form.Select name="repas" value={donnees.repas} onChange={handleChange}>
                  <option value="">-- Sélectionner --</option>
                  <option value="petit_dejeuner">Petit déjeuner</option>
                  <option value="dejeuner">Déjeuner</option>
                  <option value="diner">Dîner</option>
                  <option value="collation">Collation</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Insuline</Form.Label>
                <Form.Select name="insuline" value={donnees.insuline} onChange={handleChange}>
                  <option value="">-- Sélectionner --</option>
                  <option value="rapide">Insuline rapide</option>
                  <option value="lente">Insuline lente</option>
                  <option value="mixte">Mixte</option>
                  <option value="aucune">Aucune</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Activité physique</Form.Label>
                <Form.Select name="activite" value={donnees.activite} onChange={handleChange}>
                  <option value="">-- Sélectionner --</option>
                  <option value="légère">Légère</option>
                  <option value="modérée">Modérée</option>
                  <option value="intense">Intense</option>
                  <option value="aucune">Aucune</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Symptômes</Form.Label>
                <Form.Select name="symptome" value={donnees.symptome} onChange={handleChange}>
                  <option value="">-- Sélectionner --</option>
                  <option value="aucun">Aucun</option>
                  <option value="hypoglycémie">Hypoglycémie</option>
                  <option value="fatigue">Fatigue</option>
                  <option value="vertige">Vertige</option>
                  <option value="autre">Autre</option>
                </Form.Select>
              </Form.Group>

              <Button variant="success" type="submit" className="w-100">
                Enregistrer mes données
              </Button>

              {message && (
                <div className={`mt-3 text-${message.includes('✅') ? 'success' : 'danger'} text-center`}>
                  {message}
                </div>
              )}
            </Form>
          </Card>
        </Container>
      </div>
    </Row>
  );
}

export default AjouterDonneeJournee;
