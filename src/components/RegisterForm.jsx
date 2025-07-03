import React, { useState } from 'react';
import axios from 'axios';

function RegisterForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    prenom: '',
    nom: '',
    role: 'PATIENT'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', formData);
      console.log('Inscription réussie', response.data);
      alert('Inscription réussie');
    } catch (error) {
      console.error('Erreur lors de l\'inscription', error);
      alert('Erreur lors de l\'inscription');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Inscription</h2>
      <input type="text" name="username" placeholder="Nom d'utilisateur" onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} required />
      <input type="text" name="prenom" placeholder="Prénom" onChange={handleChange} required />
      <input type="text" name="nom" placeholder="Nom" onChange={handleChange} required />
      <button type="submit">S'inscrire</button>
    </form>
  );
}

export default RegisterForm;
