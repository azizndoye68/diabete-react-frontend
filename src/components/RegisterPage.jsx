import React, { useState } from 'react';
import api from '../services/api';
import { Nav, Navbar, Form, Button, Container, Alert } from 'react-bootstrap';
import { FaPhoneAlt, FaEnvelope, FaQuestionCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import logoDiabete from '../images/logo-diabete.png';






function RegisterForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    prenom: '',
    nom: '',
    role: 'PATIENT'
  });

  const [message, setMessage] = useState('');
    const navigate = useNavigate();
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/auth/register', formData);
      console.log('Inscription réussie', response.data);
      setMessage('Inscription réussie ✅');
    } catch (error) {
      console.error('Erreur lors de l\'inscription', error);
      setMessage('Erreur lors de l\'inscription ❌');
    }
  };

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
                    <Navbar.Brand
                        href="/"
                        className="d-flex align-items-center fw-bold text-uppercase"
                        style={{ color: '#ffffff', letterSpacing: '1px' }}
                    >
                        <img
                            src={logoDiabete}
                            alt="Logo Diabète"
                            width="60"
                            height="60"
                            className="me-2"
                            style={{ borderRadius: '4px' }}
                        />
                        <span className="fs-4">
                            Suivi<span style={{ color: '#ffc107' }}>Diabète</span> SN
                        </span>
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
      <Container className="mt-5" style={{ maxWidth: '500px' }}>
      <h2 className="text-success mb-4 text-center">Inscription</h2>

      {message && <Alert variant={message.includes('Erreur') ? 'danger' : 'success'}>{message}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nom d'utilisateur</Form.Label>
          <Form.Control
            type="text"
            name="username"
            placeholder="Nom d'utilisateur"
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
            placeholder="Email"
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
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Prénom</Form.Label>
          <Form.Control
            type="text"
            name="prenom"
            placeholder="Prénom"
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
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button variant="success" type="submit" className="w-100">
          S'inscrire
        </Button>
      </Form>
    </Container>
    </div>
    
  );
}

export default RegisterForm;
