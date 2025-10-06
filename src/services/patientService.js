// src/services/patientService.js
import api from './api';

export const getPatients = async () => {
  const res = await api.get('/api/patients');
  return res.data;
};
