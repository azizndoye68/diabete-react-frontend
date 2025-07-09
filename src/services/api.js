// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercepteur pour ajouter automatiquement le token dans les requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Récupère le token du localStorage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Ajoute l'en-tête Authorization
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
