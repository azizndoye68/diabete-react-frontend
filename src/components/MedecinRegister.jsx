import React, { useState } from 'react';
import api from '../services/api';
import { Container, Button, Form, Alert } from 'react-bootstrap';

function RegisterMedecinForm() {
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'MEDECIN',
    prenom: '',
    nom: '',
    telephone: '',
    dateNaissance: '',
    sexe: '',
    specialite: '',
    adresse: '',
    ville: '',
    region: '',
  });

  const [utilisateurId, setUtilisateurId] = useState(null);

  // Gestion des changements de champs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Étape 1 : Créer l'utilisateur
  const submitAuth = async () => {
    try {
      console.log("Envoi données auth :", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      const authResponse = await api.post('/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      console.log("Réponse API auth/register :", authResponse.data);

      const id = authResponse.data.id;
      if (!id) throw new Error("Utilisateur non créé, ID manquant");

      setUtilisateurId(id);
      console.log("UtilisateurId enregistré :", id);

      setStep(2);
      setMessage('Utilisateur créé ✅ Veuillez compléter vos informations médecin.');

    } catch (error) {
      console.error("Erreur lors de submitAuth :", error);
      setMessage('Erreur lors de la création de l’utilisateur ❌');
    }
  };

  // Étape 2 : Créer le médecin
  const submitMedecin = async () => {
    try {
      if (!utilisateurId) throw new Error("UtilisateurId manquant");

      const medecinData = {
        utilisateurId: utilisateurId,
        prenom: formData.prenom,
        nom: formData.nom,
        telephone: formData.telephone,
        dateNaissance: formData.dateNaissance,
        sexe: formData.sexe,
        specialite: formData.specialite,
        adresse: formData.adresse,
        ville: formData.ville,
        region: formData.region,
      };

      console.log("Envoi données médecin :", medecinData);

      await api.post('/api/medecins', medecinData);

      setMessage('Inscription médecin réussie ✅');
      setStep(3);

    } catch (error) {
      console.error("Erreur lors de submitMedecin :", error);
      setMessage('Erreur lors de la création du médecin ❌');
    }
  };

  return (
    <Container style={{ maxWidth: '600px', marginTop: '2rem' }}>
      <h2 className="mb-4 text-success text-center">Inscription Médecin</h2>

      {message && <Alert variant={message.includes('Erreur') ? 'danger' : 'success'}>{message}</Alert>}

      {/* Étape 1 : Création utilisateur */}
      {step === 1 && (
        <Form onSubmit={(e) => { e.preventDefault(); submitAuth(); }}>
          <Form.Group className="mb-3">
            <Form.Label>Nom d'utilisateur</Form.Label>
            <Form.Control type="text" name="username" value={formData.username} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mot de passe</Form.Label>
            <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
          </Form.Group>

          <Button variant="success" type="submit" className="w-100">Suivant</Button>
        </Form>
      )}

      {/* Étape 2 : Création médecin */}
      {step === 2 && (
        <Form onSubmit={(e) => { e.preventDefault(); submitMedecin(); }}>
          <Form.Group className="mb-3">
            <Form.Label>Prénom</Form.Label>
            <Form.Control type="text" name="prenom" value={formData.prenom} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nom</Form.Label>
            <Form.Control type="text" name="nom" value={formData.nom} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Téléphone</Form.Label>
            <Form.Control type="tel" name="telephone" value={formData.telephone} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Date de naissance</Form.Label>
            <Form.Control type="date" name="dateNaissance" value={formData.dateNaissance} onChange={handleChange} required />
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
            <Form.Label>Spécialité</Form.Label>
            <Form.Control type="text" name="specialite" value={formData.specialite} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Adresse</Form.Label>
            <Form.Control type="text" name="adresse" value={formData.adresse} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ville</Form.Label>
            <Form.Control type="text" name="ville" value={formData.ville} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Région</Form.Label>
            <Form.Control type="text" name="region" value={formData.region} onChange={handleChange} />
          </Form.Group>

          <Button variant="secondary" className="me-2" onClick={() => setStep(1)}>Retour</Button>
          <Button variant="success" type="submit">S'inscrire</Button>
        </Form>
      )}

      {/* Étape 3 : Succès */}
      {step === 3 && (
        <div className="text-center">
          <h4>Inscription réussie ! Vous pouvez maintenant vous connecter.</h4>
          <Button variant="success" onClick={() => window.location.href = '/login'}>Connexion</Button>
        </div>
      )}
    </Container>
  );
}

export default RegisterMedecinForm;
