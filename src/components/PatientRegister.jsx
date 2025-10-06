import React, { useState } from 'react';
import api from '../services/api';
import { Container, Button, Form, Alert } from 'react-bootstrap';

function RegisterPatientForm() {
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'PATIENT',
    prenom: '',
    nom: '',
    telephone: '',
    dateNaissance: '',
    sexe: '',
    typeDiabete: '',
    traitement: '',
    adresse: '',
    ville: '',
    region: '',
  });

  // Gérer les changements de champ
  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  // Envoyer les infos d'auth (étape 1)
  const submitAuth = async () => {
    try {
      const authResponse = await api.post('/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

     // ✅ Déclaration une seule fois
      const utilisateurId = authResponse.data.id;
      console.log("ID utilisateur :", utilisateurId);

      // Envoyer ensuite les infos patient (étape 2)
      await api.post('/api/patients', {
        utilisateurId: utilisateurId,
        prenom: formData.prenom,
        nom: formData.nom,
        telephone: formData.telephone,
        dateNaissance: formData.dateNaissance,
        sexe: formData.sexe,
        typeDiabete: formData.typeDiabete,
        traitement: formData.traitement,
        adresse: formData.adresse,
        ville: formData.ville,
        region: formData.region,
      });

      setMessage('Inscription réussie ✅');
      setStep(3); // terminer

    } catch (error) {
      console.error(error);
      setMessage('Erreur lors de l\'inscription ❌');
    }
  };

  const handleSubmitStep1 = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmitStep2 = (e) => {
    e.preventDefault();
    submitAuth();
  };

  return (
    <Container style={{ maxWidth: '600px', marginTop: '2rem' }}>
      <h2 className="mb-4 text-success text-center">Inscription Patient</h2>

      {message && <Alert variant={message.includes('Erreur') ? 'danger' : 'success'}>{message}</Alert>}

      {step === 1 && (
        <Form onSubmit={handleSubmitStep1}>
          <Form.Group className="mb-3">
            <Form.Label>Nom d'utilisateur</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mot de passe</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button variant="success" type="submit" className="w-100">Suivant</Button>
        </Form>
      )}

      {step === 2 && (
        <Form onSubmit={handleSubmitStep2}>
          <Form.Group className="mb-3">
            <Form.Label>Prénom</Form.Label>
            <Form.Control
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nom</Form.Label>
            <Form.Control
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Téléphone</Form.Label>
            <Form.Control
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Date de naissance</Form.Label>
            <Form.Control
              type="date"
              name="dateNaissance"
              value={formData.dateNaissance}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Sexe</Form.Label>
            <Form.Select name="sexe" value={formData.sexe} onChange={handleChange} required>
              <option value="">Choisir...</option>
              <option value="HOMME">Homme</option>
              <option value="FEMME">Femme</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Type de diabète</Form.Label>
            <Form.Select name="typeDiabete" value={formData.typeDiabete} onChange={handleChange} required>
              <option value="">Choisir...</option>
              <option value="TYPE1">Type 1</option>
              <option value="TYPE2">Type 2</option>
              <option value="GESTATIONNEL">Gestationnel</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Traitement</Form.Label>
            <Form.Control
              type="text"
              name="traitement"
              value={formData.traitement}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Adresse</Form.Label>
            <Form.Control
              type="text"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ville</Form.Label>
            <Form.Control
              type="text"
              name="ville"
              value={formData.ville}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Région</Form.Label>
            <Form.Control
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
            />
          </Form.Group>

          <Button variant="secondary" className="me-2" onClick={() => setStep(1)}>
            Retour
          </Button>
          <Button variant="success" type="submit">
            S'inscrire
          </Button>
        </Form>
      )}

      {step === 3 && (
        <div className="text-center">
          <h4>Inscription réussie ! Vous pouvez maintenant vous connecter.</h4>
          <Button variant="success" onClick={() => window.location.href = '/login'}>
            Connexion
          </Button>
        </div>
      )}
    </Container>
  );
}

export default RegisterPatientForm;
