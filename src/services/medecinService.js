// src/services/medecinService.js
import api from './api';

export const getProfile = async () => {
  const res = await api.get('/api/medecin/profile'); // endpoint backend
  return res.data;
};

export const getSummary = async () => {
  // Ex : renvoie { totalPatients, avgGlycemie, lastGly, trends: [...] }
  const res = await api.get('/api/medecin/summary');
  return res.data;
};
