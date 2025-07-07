import React, { useState } from 'react';
import api from '../services/api'; // 🔗 Utilisation de ton service axios
import { Form, Button, Container, Alert } from 'react-bootstrap';

function LoginForm() {
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
      alert('Connexion réussie');
      setMessage('Connexion réussie ✅');

      // 🔐 Exemple si tu veux gérer un token plus tard :
       //localStorage.setItem('token', response.data.token);

      // 🔄 Tu peux aussi rediriger ici après connexion si tu as une page dashboard
      // navigate('/dashboard');
    } catch (error) {
      console.error('Erreur de connexion', error);
      setMessage('Erreur de connexion ❌');
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '500px' }}>
      <h2 className="mb-4 text-center">Connexion</h2>
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

        <Button variant="primary" type="submit" className="w-100">
          Se connecter
        </Button>
      </Form>
    </Container>
  );
}

export default LoginForm;
