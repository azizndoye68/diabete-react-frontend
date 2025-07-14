// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter automatiquement le token sauf pour login/register
api.interceptors.request.use(
  (config) => {
    const isAuthRoute = config.url.includes('/api/auth/login') || config.url.includes('/api/auth/register');
    
    if (!isAuthRoute) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
