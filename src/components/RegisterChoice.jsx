// src/components/RegisterChoice.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Navbar, Container, Nav, Row, Col, Card } from 'react-bootstrap';
import { FaPhoneAlt, FaEnvelope, FaQuestionCircle, FaUser, FaUserMd } from 'react-icons/fa';
import './RegisterChoice.css';
import logoDiabete from '../images/logo-diabete.png';

function RegisterChoice() {
  const navigate = useNavigate();

  return (
    <div className="register-choice-page">
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
                className="btn-inscription active"
              >
                INSCRIPTION
              </Button>
              <Button
                className="btn-connexion"
                onClick={() => navigate('/login')}
              >
                CONNEXION
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Contenu principal */}
      <div className="choice-content">
        <Container>
          <div className="choice-header text-center">
            <div className="choice-badge">
              REJOIGNEZ-NOUS
            </div>
            <h1 className="choice-title">
              Créez votre <span className="gradient-text">compte</span>
            </h1>
            <p className="choice-description">
              Choisissez le type de compte qui correspond à votre profil
            </p>
            <p className="login-link-text">
              Vous avez déjà un compte ?{' '}
              <button 
                className="login-link"
                onClick={() => navigate('/login')}
              >
                Connectez-vous
              </button>
            </p>
          </div>

          <Row className="justify-content-center g-4 mt-4">
            {/* Carte Patient */}
            <Col xs={12} md={6} lg={5}>
              <Card 
                className="choice-card patient-card"
                onClick={() => navigate('/register/patient')}
              >
                <div className="card-header-custom patient-header">
                  <div className="card-icon">
                    <FaUser />
                  </div>
                </div>
                <Card.Body className="card-body-custom">
                  <h3 className="card-title-custom">Je suis patient(e)</h3>
                  <p className="card-description">
                    Suivez votre glycémie, consultez votre équipe médicale et 
                    gérez votre traitement en toute simplicité
                  </p>
                  <ul className="card-features">
                    <li>
                      <i className="bi bi-check-circle-fill"></i>
                      Suivi de glycémie personnalisé
                    </li>
                    <li>
                      <i className="bi bi-check-circle-fill"></i>
                      Messagerie avec votre médecin
                    </li>
                    <li>
                      <i className="bi bi-check-circle-fill"></i>
                      Statistiques et graphiques
                    </li>
                  </ul>
                  <div className="card-action">
                    <span>Commencer</span>
                    <i className="bi bi-arrow-right"></i>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Carte Médecin */}
            <Col xs={12} md={6} lg={5}>
              <Card 
                className="choice-card medecin-card"
                onClick={() => navigate('/register/medecin')}
              >
                <div className="card-header-custom medecin-header">
                  <div className="card-icon">
                    <FaUserMd />
                  </div>
                </div>
                <Card.Body className="card-body-custom">
                  <h3 className="card-title-custom">Je suis professionnel de santé</h3>
                  <p className="card-description">
                    Gérez vos patients, suivez leur évolution et assurez un 
                    accompagnement médical optimal à distance
                  </p>
                  <ul className="card-features">
                    <li>
                      <i className="bi bi-check-circle-fill"></i>
                      Gestion de patients
                    </li>
                    <li>
                      <i className="bi bi-check-circle-fill"></i>
                      Tableau de bord médical
                    </li>
                    <li>
                      <i className="bi bi-check-circle-fill"></i>
                      Outils de suivi avancés
                    </li>
                  </ul>
                  <div className="card-action">
                    <span>Commencer</span>
                    <i className="bi bi-arrow-right"></i>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Section avantages */}
          <div className="benefits-section text-center mt-5">
            <h4 className="benefits-title">Pourquoi choisir SuiviDiabète ?</h4>
            <Row className="g-4 mt-3">
              <Col md={4}>
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <h6 className="benefit-title">Sécurisé</h6>
                  <p className="benefit-text">
                    Vos données de santé sont protégées et cryptées
                  </p>
                </div>
              </Col>
              <Col md={4}>
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <i className="bi bi-people"></i>
                  </div>
                  <h6 className="benefit-title">Collaboratif</h6>
                  <p className="benefit-text">
                    Connexion directe entre patients et professionnels
                  </p>
                </div>
              </Col>
              <Col md={4}>
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <i className="bi bi-graph-up-arrow"></i>
                  </div>
                  <h6 className="benefit-title">Efficace</h6>
                  <p className="benefit-text">
                    Suivi en temps réel et analyses détaillées
                  </p>
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </div>
  );
}

export default RegisterChoice;