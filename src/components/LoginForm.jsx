import React, { useState } from 'react';
import axios from 'axios';

function LoginForm() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', credentials);
      console.log('Connexion réussie', response.data);
      alert('Connexion réussie');
      // tu peux stocker le token ici si ton backend le renvoie
    } catch (error) {
      console.error('Erreur de connexion', error);
      alert('Erreur de connexion');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Connexion</h2>
      <input type="username" name="username" placeholder="Nom utilisateur" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} required />
      <button type="submit">Se connecter</button>
    </form>
  );
}

export default LoginForm;
