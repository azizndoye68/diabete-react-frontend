// src/components/RegisterChoice.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Navbar, Container, Nav, Row, Col, Card } from 'react-bootstrap';
import { FaPhoneAlt, FaEnvelope, FaQuestionCircle } from 'react-icons/fa';
import './RegisterChoice.css';

function RegisterChoice() {
  const navigate = useNavigate();

  return (
    
    <div>

      {/* Top bar */}
              <div className="top-bar d-flex justify-content-between align-items-center px-4 py-2 text-white">
                      <div>
                          <span className="me-4">FR | BE</span>
                          <FaPhoneAlt className="me-2" /> +221 77 123 45 67
                          <span className="mx-3">|</span>
                          Du Lundi au Vendredi | 9h - 17h
                      </div>
                      <div>
                          <FaEnvelope className="me-2" /> contact@diabete-platforme.sn
                      </div>
                </div>
                   {/* Navbar */}
            <Navbar bg="success" variant="dark" expand="lg" className="px-4">
                <Container fluid>
                    <Navbar.Brand href="/" className="fw-bold fs-3 text-uppercase" style={{ color: '#ffffff', letterSpacing: '1px' }}>
                         Suivi<span style={{ color: '#ffc107' }}>Diabète</span> SN
                    </Navbar.Brand>

                    <Nav className="ms-auto d-flex align-items-center">
                        <Nav.Link href="#" className="text-white me-3">
                            <FaQuestionCircle className="me-1" /> Aide
                        </Nav.Link>
                        <Button
                            variant="light"
                            className="rounded-3 me-2 nav-btn"
                            onClick={() => navigate('/register/choice')}
                        >
                            INSCRIPTION
                        </Button>
                        <Button
                            variant="outline-light"
                            className="rounded-3 nav-btn"
                            onClick={() => navigate('/login')}
                        >
                            CONNEXION
                        </Button>
                    </Nav>
                </Container>
            </Navbar>

       <Container className="my-5 text-center">
      <h1 className="fw-bold mb-4 text-success">Choisissez votre profil pour vous inscrire</h1>
      <p className="mb-5">
        Vous avez déjà un compte SuiviDiabète SN ?{' '}
        <span className="text-decoration-underline text-success" role="button" onClick={() => navigate('/login')}>
          Connectez-vous
        </span>
      </p>

      <Row className="justify-content-center">
        <Col xs={12} md={6} lg={4} className="mb-4">
          <Card className="choice-card p-3" onClick={() => navigate('/register')}>
            <Card.Img
              variant="top"
              src="https://cdn-icons-png.flaticon.com/512/1077/1077063.png"
              alt="Patient"
              className="mx-auto"
              style={{ width: '120px' }}
            />
            <Card.Body>
              <Card.Title className="fs-5 fw-bold">Je suis un·e patient·e</Card.Title>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={4} className="mb-4">
          <Card className="choice-card p-3" onClick={() => navigate('/register/professionnel')}>
            <Card.Img
              variant="top"
              src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png"
              alt="Professionnel"
              className="mx-auto"
              style={{ width: '120px' }}
            />
            <Card.Body>
              <Card.Title className="fs-5 fw-bold">Je suis un professionnel de santé</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>

    </div>
   
  );
}

export default RegisterChoice;
