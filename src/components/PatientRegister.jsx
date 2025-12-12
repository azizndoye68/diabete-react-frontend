import React, { useState } from 'react';
import api from '../services/api';
import { Container, Button, Form, Alert, ProgressBar, Card, Spinner } from 'react-bootstrap';
import { FaUser, FaArrowRight, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import './RegisterPatientForm.css';

function RegisterPatientForm() {
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    numeroProfessionnelMedecin: '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      // 1️⃣ Création Auth
      const authResponse = await api.post('/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      const utilisateurId = authResponse.data.id;
      console.log("✅ ID utilisateur créé :", utilisateurId);

      // 2️⃣ Création Patient
      await api.post('/api/patients', {
        utilisateurId,
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
        numeroProfessionnelMedecin: formData.numeroProfessionnelMedecin,
      });

      setMessage('✅ Inscription réussie ! Vous pouvez maintenant vous connecter.');
      setStep(4);
    } catch (error) {
      console.error(error);
      setMessage('❌ Erreur lors de l’inscription. Vérifiez vos informations ou le code médecin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => setStep((prev) => prev + 1);
  const handlePrev = () => setStep((prev) => prev - 1);
  const progress = (step / 3) * 100;

  return (
    <Container className="register-container">
      <Card className="register-card shadow-lg">
        <div className="text-center mb-4">
          <FaUser size={50} className="text-success mb-3" />
          <h3 className="fw-bold text-success">Inscription Patient</h3>
          <ProgressBar now={progress} className="my-3" variant="success" />
          <p className="text-muted">Étape {step <= 3 ? step : 3} sur 3</p>
        </div>

        {message && (
          <Alert variant={message.includes('❌') ? 'danger' : 'success'}>
            {message}
          </Alert>
        )}

        {/* Étape 1 : Identifiants */}
        {step === 1 && (
          <Form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
            <Form.Group className="mb-3">
              <Form.Label>Nom d'utilisateur</Form.Label>
              <Form.Control name="username" value={formData.username} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
            </Form.Group>
            <Button variant="success" type="submit" className="w-100">
              Suivant <FaArrowRight className="ms-1" />
            </Button>
          </Form>
        )}

        {/* Étape 2 : Infos personnelles */}
        {step === 2 && (
          <Form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
            <Form.Group className="mb-3">
              <Form.Label>Prénom</Form.Label>
              <Form.Control name="prenom" value={formData.prenom} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control name="nom" value={formData.nom} onChange={handleChange} required />
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
              <Form.Label>Type de diabète</Form.Label>
              <Form.Select name="typeDiabete" value={formData.typeDiabete} onChange={handleChange} required>
                <option value="">Choisir...</option>
                <option value="TYPE1">Type 1</option>
                <option value="TYPE2">Type 2</option>
                <option value="GESTATIONNEL">Gestationnel</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={handlePrev}>
                <FaArrowLeft /> Retour
              </Button>
              <Button variant="success" type="submit">
                Suivant <FaArrowRight />
              </Button>
            </div>
          </Form>
        )}

        {/* Étape 3 : Adresse + code médecin */}
        {step === 3 && (
          <Form onSubmit={(e) => { e.preventDefault(); handleFinalSubmit(); }}>
            <Form.Group className="mb-3">
              <Form.Label>Adresse</Form.Label>
              <Form.Control name="adresse" value={formData.adresse} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ville</Form.Label>
              <Form.Control name="ville" value={formData.ville} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Région</Form.Label>
              <Form.Control name="region" value={formData.region} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Code de suivi (numéro professionnel du médecin)</Form.Label>
              <Form.Control
                name="numeroProfessionnelMedecin"
                value={formData.numeroProfessionnelMedecin}
                onChange={handleChange}
                placeholder="Ex : MED25A1F"
              />
              <Form.Text className="text-muted">
                Demandez ce code à votre médecin avant de vous inscrire.
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={handlePrev}>
                <FaArrowLeft /> Retour
              </Button>
              <Button variant="success" type="submit" disabled={isLoading}>
                {isLoading ? <Spinner animation="border" size="sm" /> : <>S'inscrire <FaCheckCircle /></>}
              </Button>
            </div>
          </Form>
        )}

        {/* Étape 4 : Succès */}
        {step === 4 && (
          <div className="text-center py-4">
            <FaCheckCircle size={60} className="text-success mb-3" />
            <h4 className="fw-bold text-success">Inscription réussie 🎉</h4>
            <p>Vous pouvez maintenant vous connecter.</p>
            <Button variant="success" onClick={() => window.location.href = '/login'}>
              Se connecter
            </Button>
          </div>
        )}
      </Card>
    </Container>
  );
}

export default RegisterPatientForm;
