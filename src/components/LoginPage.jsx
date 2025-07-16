import React, { useState } from 'react';
import api from '../services/api'; // 🔗 Utilisation de ton service axios
import { Nav, Navbar, Form, Button, Container, Alert } from 'react-bootstrap';
import { FaPhoneAlt, FaEnvelope, FaQuestionCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import logoDiabete from '../images/logo-diabete.png';



function LoginForm() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/auth/login', credentials);
      console.log('Connexion réussie', response.data);
      //alert('Connexion réussie');
      //setMessage('Connexion réussie ✅');

      // 🔐 Exemple si tu veux gérer un token plus tard :
      localStorage.setItem('token', response.data.token);

      // 🔄 Tu peux aussi rediriger ici après connexion si tu as une page dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur de connexion', error);
      setMessage('Erreur de connexion ❌');
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
      <h2 className="text-success mb-4 text-center">Connexion</h2>
      {message && <Alert variant={message.includes('Erreur') ? 'danger' : 'success'}>{message}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nom utilisateur</Form.Label>
          <Form.Control
            type="text"
            name="username"
            placeholder="Nom utilisateur"
            value={credentials.username}
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
            value={credentials.password}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button variant="success" type="submit" className="w-100">
          Se connecter
        </Button>
      </Form>
    </Container>
    </div>

    
  );
}

export default LoginForm;
