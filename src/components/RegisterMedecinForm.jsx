import React, { useState } from 'react';
import api from '../services/api';
import { Container, Button, Form, Alert, Card, ProgressBar, Spinner } from 'react-bootstrap';
import { FaUserMd, FaArrowRight, FaArrowLeft, FaCheckCircle, FaUser, FaBriefcase, FaLock, FaEnvelope } from 'react-icons/fa';
import './RegisterMedecinForm.css';

function RegisterMedecinForm() {
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'MEDECIN',
    prenom: '',
    nom: '',
    telephone: '',
    dateNaissance: '',
    sexe: '',
    specialite: '',
    nomService: '',
    adresse: '',
    ville: '',
    region: '',
  });

  const [utilisateurId, setUtilisateurId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Nettoyer l'erreur du champ modifié
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // ========================================
  // VALIDATION ÉTAPE 1 : Compte utilisateur
  // ========================================
  const validateStep1 = () => {
    const newErrors = {};

    // Username
    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est obligatoire";
    } else if (formData.username.length < 3 || formData.username.length > 50) {
      newErrors.username = "Le nom d'utilisateur doit contenir entre 3 et 50 caractères";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "L'email est obligatoire";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email invalide";
    }

    // Password
    if (!formData.password) {
      newErrors.password = "Le mot de passe est obligatoire";
    } else if (formData.password.length < 5) {
      newErrors.password = "Le mot de passe doit contenir au moins 5 caractères";
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Veuillez confirmer le mot de passe";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================
  // VALIDATION ÉTAPE 2 : Infos personnelles
  // ========================================
  const validateStep2 = () => {
    const newErrors = {};

    // Prénom
    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est obligatoire";
    } else if (formData.prenom.length < 2 || formData.prenom.length > 50) {
      newErrors.prenom = "Le prénom doit contenir entre 2 et 50 caractères";
    }

    // Nom
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est obligatoire";
    } else if (formData.nom.length < 2 || formData.nom.length > 50) {
      newErrors.nom = "Le nom doit contenir entre 2 et 50 caractères";
    }

    // Téléphone
    if (!formData.telephone.trim()) {
      newErrors.telephone = "Le numéro de téléphone est obligatoire";
    } else if (!/^[0-9]{9,15}$/.test(formData.telephone)) {
      newErrors.telephone = "Le numéro de téléphone doit contenir entre 9 et 15 chiffres";
    }

    // Date de naissance
    if (!formData.dateNaissance) {
      newErrors.dateNaissance = "La date de naissance est obligatoire";
    } else {
      const birthDate = new Date(formData.dateNaissance);
      const today = new Date();
      if (birthDate >= today) {
        newErrors.dateNaissance = "La date de naissance doit être dans le passé";
      }
      // Vérifier que le médecin a au moins 18 ans
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.dateNaissance = "Vous devez avoir au moins 18 ans";
      }
    }

    // Sexe
    if (!formData.sexe) {
      newErrors.sexe = "Le sexe est obligatoire";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================
  // VALIDATION ÉTAPE 3 : Infos professionnelles
  // ========================================
  const validateStep3 = () => {
    const newErrors = {};

    // Spécialité
    if (!formData.specialite.trim()) {
      newErrors.specialite = "La spécialité est obligatoire";
    } else if (formData.specialite.length > 100) {
      newErrors.specialite = "La spécialité ne doit pas dépasser 100 caractères";
    }

    // Nom du service
    if (!formData.nomService.trim()) {
      newErrors.nomService = "Le nom du service est obligatoire";
    } else if (formData.nomService.length > 100) {
      newErrors.nomService = "Le nom du service ne doit pas dépasser 100 caractères";
    }

    // Adresse (optionnelle mais limitée)
    if (formData.adresse && formData.adresse.length > 255) {
      newErrors.adresse = "L'adresse est trop longue (max 255 caractères)";
    }

    // Ville (optionnelle mais limitée)
    if (formData.ville && formData.ville.length > 100) {
      newErrors.ville = "La ville ne doit pas dépasser 100 caractères";
    }

    // Région (optionnelle mais limitée)
    if (formData.region && formData.region.length > 100) {
      newErrors.region = "La région ne doit pas dépasser 100 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================
  // SOUMISSION ÉTAPE 1
  // ========================================
  const submitAuth = async () => {
    if (!validateStep1()) {
      setMessage('❌ Veuillez corriger les erreurs avant de continuer');
      return;
    }

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
      setMessage('');
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Erreur lors de la création du compte';
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // NAVIGATION ÉTAPE 2
  // ========================================
  const handleStep2Next = () => {
    if (!validateStep2()) {
      setMessage('❌ Veuillez corriger les erreurs avant de continuer');
      return;
    }
    setMessage('');
    setStep(3);
  };

  // ========================================
  // SOUMISSION FINALE
  // ========================================
  const submitMedecin = async () => {
    if (!validateStep3()) {
      setMessage('❌ Veuillez corriger les erreurs avant de soumettre');
      return;
    }

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
        nomService: formData.nomService,
        adresse: formData.adresse || null,
        ville: formData.ville || null,
        region: formData.region || null,
      };

      await api.post('/api/medecins', medecinData);
      setStep(4);
      setMessage('');
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Erreur lors de la création du profil médecin';
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 3;
  const progressPercentage = (step / totalSteps) * 100;

  return (
    <div className="register-wrapper">
      <Container className="register-container">
        <Card className="register-card">
          {/* En-tête */}
          <div className="register-header">
            <div className="header-icon">
              <FaUserMd />
            </div>
            <h2 className="header-title">Inscription Médecin</h2>
            <p className="header-subtitle">Rejoignez notre plateforme de suivi diabète</p>
          </div>

          {/* Barre de progression */}
          {step <= 3 && (
            <div className="progress-section">
              <div className="progress-steps">
                <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                  <div className="step-circle">
                    {step > 1 ? <FaCheckCircle /> : '1'}
                  </div>
                  <span className="step-label">Compte</span>
                </div>
                <div className="progress-line"></div>
                <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                  <div className="step-circle">
                    {step > 2 ? <FaCheckCircle /> : '2'}
                  </div>
                  <span className="step-label">Profil</span>
                </div>
                <div className="progress-line"></div>
                <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                  <div className="step-circle">3</div>
                  <span className="step-label">Professionnel</span>
                </div>
              </div>
              <ProgressBar now={progressPercentage} className="custom-progress-bar" />
            </div>
          )}

          {/* Message d'alerte */}
          {message && (
            <Alert variant={message.includes('❌') ? 'danger' : 'success'} className="custom-alert" dismissible onClose={() => setMessage('')}>
              {message}
            </Alert>
          )}

          {/* Corps du formulaire */}
          <div className="register-body">
            {/* ÉTAPE 1 : Création de compte */}
            {step === 1 && (
              <Form onSubmit={(e) => { e.preventDefault(); submitAuth(); }}>
                <div className="form-section-title">
                  <FaLock className="section-icon" />
                  <h5>Créez votre compte</h5>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Nom d'utilisateur <span className="required">*</span></Form.Label>
                  <div className="input-with-icon">
                    <FaUser className="input-icon" />
                    <Form.Control
                      type="text"
                      name="username"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={handleChange}
                      isInvalid={!!errors.username}
                      className="form-control-custom"
                    />
                    <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Adresse email <span className="required">*</span></Form.Label>
                  <div className="input-with-icon">
                    <FaEnvelope className="input-icon" />
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="exemple@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      isInvalid={!!errors.email}
                      className="form-control-custom"
                    />
                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mot de passe <span className="required">*</span></Form.Label>
                  <div className="input-with-icon">
                    <FaLock className="input-icon" />
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                      className="form-control-custom"
                    />
                    <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirmer le mot de passe <span className="required">*</span></Form.Label>
                  <div className="input-with-icon">
                    <FaLock className="input-icon" />
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      isInvalid={!!errors.confirmPassword}
                      className="form-control-custom"
                    />
                    <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
                  </div>
                </Form.Group>

                <Button variant="primary" type="submit" className="btn-custom btn-next" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Création...
                    </>
                  ) : (
                    <>
                      Suivant
                      <FaArrowRight className="ms-2" />
                    </>
                  )}
                </Button>
              </Form>
            )}

            {/* ÉTAPE 2 : Informations personnelles */}
            {step === 2 && (
              <Form onSubmit={(e) => { e.preventDefault(); handleStep2Next(); }}>
                <div className="form-section-title">
                  <FaUser className="section-icon" />
                  <h5>Informations personnelles</h5>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Prénom <span className="required">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="prenom"
                        placeholder="Jean"
                        value={formData.prenom}
                        onChange={handleChange}
                        isInvalid={!!errors.prenom}
                        className="form-control-custom"
                      />
                      <Form.Control.Feedback type="invalid">{errors.prenom}</Form.Control.Feedback>
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Nom <span className="required">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="nom"
                        placeholder="Dupont"
                        value={formData.nom}
                        onChange={handleChange}
                        isInvalid={!!errors.nom}
                        className="form-control-custom"
                      />
                      <Form.Control.Feedback type="invalid">{errors.nom}</Form.Control.Feedback>
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Téléphone <span className="required">*</span></Form.Label>
                      <Form.Control
                        type="tel"
                        name="telephone"
                        placeholder="771234567"
                        value={formData.telephone}
                        onChange={handleChange}
                        isInvalid={!!errors.telephone}
                        className="form-control-custom"
                      />
                      <Form.Control.Feedback type="invalid">{errors.telephone}</Form.Control.Feedback>
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Date de naissance <span className="required">*</span></Form.Label>
                      <Form.Control
                        type="date"
                        name="dateNaissance"
                        value={formData.dateNaissance}
                        onChange={handleChange}
                        isInvalid={!!errors.dateNaissance}
                        className="form-control-custom"
                      />
                      <Form.Control.Feedback type="invalid">{errors.dateNaissance}</Form.Control.Feedback>
                    </Form.Group>
                  </div>
                </div>

                <Form.Group className="mb-4">
                  <Form.Label>Sexe <span className="required">*</span></Form.Label>
                  <Form.Select
                    name="sexe"
                    value={formData.sexe}
                    onChange={handleChange}
                    isInvalid={!!errors.sexe}
                    className="form-control-custom"
                  >
                    <option value="">Sélectionnez...</option>
                    <option value="HOMME">Homme</option>
                    <option value="FEMME">Femme</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.sexe}</Form.Control.Feedback>
                </Form.Group>

                <div className="form-actions">
                  <Button variant="light" onClick={() => setStep(1)} className="btn-custom btn-back">
                    <FaArrowLeft className="me-2" />
                    Retour
                  </Button>
                  <Button variant="primary" type="submit" className="btn-custom btn-next">
                    Suivant
                    <FaArrowRight className="ms-2" />
                  </Button>
                </div>
              </Form>
            )}

            {/* ÉTAPE 3 : Informations professionnelles */}
            {step === 3 && (
              <Form onSubmit={(e) => { e.preventDefault(); submitMedecin(); }}>
                <div className="form-section-title">
                  <FaBriefcase className="section-icon" />
                  <h5>Informations professionnelles</h5>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Spécialité <span className="required">*</span></Form.Label>
                  <Form.Select
                    name="specialite"
                    value={formData.specialite}
                    onChange={handleChange}
                    isInvalid={!!errors.specialite}
                    className="form-control-custom"
                  >
                    <option value="">Sélectionnez votre spécialité...</option>
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
                  <Form.Control.Feedback type="invalid">{errors.specialite}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nom du service ou cabinet <span className="required">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="nomService"
                    placeholder="Hôpital Principal de Dakar"
                    value={formData.nomService}
                    onChange={handleChange}
                    isInvalid={!!errors.nomService}
                    className="form-control-custom"
                  />
                  <Form.Control.Feedback type="invalid">{errors.nomService}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Adresse</Form.Label>
                  <Form.Control
                    type="text"
                    name="adresse"
                    placeholder="Avenue Cheikh Anta Diop"
                    value={formData.adresse}
                    onChange={handleChange}
                    isInvalid={!!errors.adresse}
                    className="form-control-custom"
                  />
                  <Form.Control.Feedback type="invalid">{errors.adresse}</Form.Control.Feedback>
                </Form.Group>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Ville</Form.Label>
                      <Form.Control
                        type="text"
                        name="ville"
                        placeholder="Dakar"
                        value={formData.ville}
                        onChange={handleChange}
                        isInvalid={!!errors.ville}
                        className="form-control-custom"
                      />
                      <Form.Control.Feedback type="invalid">{errors.ville}</Form.Control.Feedback>
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group className="mb-4">
                      <Form.Label>Région</Form.Label>
                      <Form.Control
                        type="text"
                        name="region"
                        placeholder="Dakar"
                        value={formData.region}
                        onChange={handleChange}
                        isInvalid={!!errors.region}
                        className="form-control-custom"
                      />
                      <Form.Control.Feedback type="invalid">{errors.region}</Form.Control.Feedback>
                    </Form.Group>
                  </div>
                </div>

                <div className="form-actions">
                  <Button variant="light" onClick={() => setStep(2)} className="btn-custom btn-back">
                    <FaArrowLeft className="me-2" />
                    Retour
                  </Button>
                  <Button variant="success" type="submit" className="btn-custom btn-submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        Soumettre
                        <FaCheckCircle className="ms-2" />
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            )}

            {/* ÉTAPE 4 : Confirmation */}
            {step === 4 && (
              <div className="success-screen">
                <div className="success-icon">
                  <FaCheckCircle />
                </div>
                <h3 className="success-title">Inscription réussie !</h3>
                <p className="success-message">
                  Votre demande d'inscription a été envoyée avec succès.<br />
                  Elle est actuellement en attente de validation par l'administrateur.
                </p>
                <div className="success-info">
                  <p><strong>Que se passe-t-il ensuite ?</strong></p>
                  <ul>
                    <li>Votre profil sera examiné par notre équipe</li>
                    <li>Vous recevrez un email de confirmation</li>
                    <li>Une fois validé, vous pourrez vous connecter</li>
                  </ul>
                </div>
                <Button variant="primary" onClick={() => window.location.href = '/login'} className="btn-custom btn-login">
                  Se connecter
                </Button>
              </div>
            )}
          </div>
        </Card>
      </Container>
    </div>
  );
}

export default RegisterMedecinForm;