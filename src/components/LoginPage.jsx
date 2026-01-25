import React, { useState } from 'react';
import api from '../services/api';
import { Nav, Navbar, Form, Button, Container, Alert, Card } from 'react-bootstrap';
import { FaPhoneAlt, FaEnvelope, FaQuestionCircle, FaLock, FaEnvelope as FaEmailIcon } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import logoDiabete from '../images/logo-diabete.png';
import './LoginForm.css';

function LoginForm() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/api/auth/login', credentials);
      console.log('Connexion réussie', response.data);

      const { token, utilisateurId, role } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('utilisateurId', utilisateurId);
      localStorage.setItem('role', role);

      setMessage('Connexion réussie ✅');

      setTimeout(() => {
        if (role === 'PATIENT') {
          navigate('/dashboard-patient');
        } else if (role === 'MEDECIN') {
          navigate('/dashboard-medecin');
        } else if (role === 'ADMIN') {
          navigate('/dashboard-admin'); 
        } else {
          navigate('/'); 
        }
      }, 1000);

    } catch (error) {
      console.error('Erreur de connexion', error);
      setMessage('Email ou mot de passe incorrect ❌');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Top bar */}
      <div className="top-bar">
        <div className="top-bar-content container-fluid">
          <div className="top-bar-left">
            <span>FR | SN</span>
            <div className="d-flex align-items-center gap-2">
              <FaPhoneAlt style={{ fontSize: '0.85rem' }} />
              <span>+221 77 123 45 67</span>
            </div>
            <span className="top-bar-divider">|</span>
            <span style={{ opacity: 0.9 }}>Lun - Ven | 9h - 17h</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <FaEnvelope style={{ fontSize: '0.85rem' }} />
            <span>contact@diabete-plateforme.sn</span>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <Navbar expand="lg" className="navbar-custom">
        <Container fluid>
          <Navbar.Brand href="/" className="d-flex align-items-center">
            <div className="logo-container">
              <img
                src={logoDiabete}
                alt="Logo Diabète"
                width="45"
                height="45"
              />
            </div>
            <span className="brand-text">
              Suivi<span className="highlight">Diabète</span> SN
            </span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="ms-auto d-flex align-items-center gap-3">
              <Nav.Link href="#aide" className="nav-link-help">
                <FaQuestionCircle /> Aide
              </Nav.Link>
              <Button
                className="btn-inscription"
                onClick={() => navigate('/register/choice')}
              >
                INSCRIPTION
              </Button>
              <Button
                className="btn-connexion active"
              >
                CONNEXION
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Contenu principal */}
      <div className="login-content">
        <Container>
          <div className="login-wrapper">
            {/* Colonne gauche - Informations */}
            <div className="login-info">
              <div className="info-content">
                <h1 className="info-title">
                  Bienvenue sur <span className="gradient-text">SuiviDiabète</span>
                </h1>
                <p className="info-description">
                  Connectez-vous pour accéder à votre espace personnel et gérer 
                  votre suivi médical en toute simplicité.
                </p>

                <div className="info-features">
                  <div className="feature-item">
                    <div className="feature-icon">
                      <i className="bi bi-shield-check"></i>
                    </div>
                    <div>
                      <h6 className="feature-title">Sécurisé</h6>
                      <p className="feature-text">Vos données sont protégées</p>
                    </div>
                  </div>

                  <div className="feature-item">
                    <div className="feature-icon">
                      <i className="bi bi-clock-history"></i>
                    </div>
                    <div>
                      <h6 className="feature-title">Disponible 24/7</h6>
                      <p className="feature-text">Accès à tout moment</p>
                    </div>
                  </div>

                  <div className="feature-item">
                    <div className="feature-icon">
                      <i className="bi bi-heart-pulse"></i>
                    </div>
                    <div>
                      <h6 className="feature-title">Suivi personnalisé</h6>
                      <p className="feature-text">Accompagnement dédié</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite - Formulaire */}
            <div className="login-form-wrapper">
              <Card className="login-card">
                <div className="login-card-header">
                  <div className="login-icon">
                    <i className="bi bi-person-circle"></i>
                  </div>
                  <h3 className="login-title">Connexion</h3>
                  <p className="login-subtitle">Accédez à votre espace personnel</p>
                </div>

                {message && (
                  <Alert 
                    variant={message.includes('Erreur') || message.includes('incorrect') ? 'danger' : 'success'}
                    className="login-alert"
                  >
                    {message}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit} className="login-form">
                  <Form.Group className="mb-4">
                    <Form.Label className="form-label-custom">Adresse email</Form.Label>
                    <div className="input-with-icon">
                      <FaEmailIcon className="input-icon" />
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="votre@email.com"
                        value={credentials.email}
                        onChange={handleChange}
                        className="form-control-custom"
                        required
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="form-label-custom">Mot de passe</Form.Label>
                    <div className="input-with-icon">
                      <FaLock className="input-icon" />
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={credentials.password}
                        onChange={handleChange}
                        className="form-control-custom"
                        required
                      />
                    </div>
                  </Form.Group>

                  <div className="form-options">
                    <Form.Check 
                      type="checkbox"
                      id="remember-me"
                      label="Se souvenir de moi"
                      className="remember-check"
                    />
                    <button type="button" className="forgot-password">
                      Mot de passe oublié ?
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="btn-login"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Connexion...
                      </>
                    ) : (
                      <>
                        Se connecter
                        <i className="bi bi-arrow-right ms-2"></i>
                      </>
                    )}
                  </Button>
                </Form>

                <div className="login-footer">
                  <p className="signup-text">
                    Pas encore de compte ?{' '}
                    <button 
                      onClick={() => navigate('/register/choice')}
                      className="signup-link"
                    >
                      Inscrivez-vous
                    </button>
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}

export default LoginForm;