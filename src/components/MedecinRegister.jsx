import React, { useState } from 'react';
import api from '../services/api';
import { Container, Button, Form, Alert, Card, ProgressBar, Spinner } from 'react-bootstrap';
import { FaUserMd, FaArrowRight, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import './RegisterMedecinForm.css';

function RegisterMedecinForm() {
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const submitAuth = async () => {
    try {
      setLoading(true);
      setMessage('');

      const authResponse = await api.post('/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      const id = authResponse.data.id;
      if (!id) throw new Error('Utilisateur non créé, ID manquant');

      setUtilisateurId(id);
      setStep(2);
      setMessage('Compte créé ✅ Veuillez compléter vos informations professionnelles.');
    } catch (error) {
      console.error(error);
      setMessage('❌ Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  const submitMedecin = async () => {
    try {
      setLoading(true);
      setMessage('');

      if (!utilisateurId) throw new Error('UtilisateurId manquant');

      const medecinData = {
        utilisateurId,
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

      await api.post('/api/medecins', medecinData);
      setMessage('✅ Inscription envoyée avec succès. En attente de validation par l’administrateur.');
      setStep(3);
    } catch (error) {
      console.error(error);
      setMessage('❌ Erreur lors de la création du profil médecin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="register-container">
      <Card className="register-card shadow-lg">
        <div className="text-center mb-4">
          <FaUserMd size={50} className="text-success mb-3" />
          <h3 className="fw-bold text-success">Inscription Médecin</h3>
          <ProgressBar now={(step / 3) * 100} className="my-3" variant="success" />
          <p className="text-muted">Étape {step} sur 3</p>
        </div>

        {message && (
          <Alert variant={message.includes('❌') ? 'danger' : 'success'}>
            {message}
          </Alert>
        )}

        {/* Étape 1 */}
        {step === 1 && (
          <Form onSubmit={(e) => { e.preventDefault(); submitAuth(); }}>
            <Form.Group className="mb-3">
              <Form.Label>Nom d’utilisateur</Form.Label>
              <Form.Control type="text" name="username" value={formData.username} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
            </Form.Group>
            <Button variant="success" type="submit" className="w-100" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : <>Suivant <FaArrowRight /></>}
            </Button>
          </Form>
        )}

        {/* Étape 2 */}
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
              <Form.Select 
                name="specialite" 
                value={formData.specialite} 
                onChange={handleChange} 
                required
              >
                <option value="">Choisir...</option>
                <option value="Généraliste">Médecin Généraliste</option>
                <option value="Diabétologue">Diabétologue</option>
                <option value="Endocrinologue">Endocrinologue</option>
                <option value="Cardiologue">Cardiologue</option>
                <option value="Pédiatre">Pédiatre</option>
                <option value="Gynécologue">Gynécologue</option>
                <option value="Ophtalmologue">Ophtalmologue</option>
                <option value="Néphrologue">Néphrologue</option>
                <option value="Nutritionniste">Nutritionniste</option>
                <option value="Infirmier">Infirmier</option>
                <option value="Autre">Autre</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Adresse</Form.Label>
              <Form.Control type="text" name="adresse" value={formData.adresse} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ville</Form.Label>
              <Form.Control type="text" name="ville" value={formData.ville} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Région</Form.Label>
              <Form.Control type="text" name="region" value={formData.region} onChange={handleChange} />
            </Form.Group>
            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={() => setStep(1)}>
                <FaArrowLeft /> Retour
              </Button>
              <Button variant="success" type="submit" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : <>Soumettre <FaCheckCircle /></>}
              </Button>
            </div>
          </Form>
        )}

        {/* Étape 3 */}
        {step === 3 && (
          <div className="text-center py-4">
            <FaCheckCircle size={60} className="text-success mb-3" />
            <h4 className="fw-bold text-success">Inscription réussie 🎉</h4>
            <p>Votre demande est en attente de validation par l’administrateur.</p>
            <Button variant="success" onClick={() => window.location.href = '/login'}>
              Se connecter
            </Button>
          </div>
        )}
      </Card>
    </Container>
  );
}

export default RegisterMedecinForm;
