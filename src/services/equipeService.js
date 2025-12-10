// src/services/equipeService.js
import api from "./api";

/** Récupérer toutes les équipes */
export const getAllEquipes = () => api.get("/api/equipes/all");

/** Récupérer une équipe par son id */
export const getEquipeById = (equipeId) =>
  api.get(`/api/equipes/${equipeId}`);

/** Créer une équipe (medecinId dans header) */
export const creerEquipe = (nom, medecinId) =>
  api.post(`/api/equipes/creer?nom=${encodeURIComponent(nom)}`, {}, { headers: { medecinId } });

/** Ajouter un médecin */
export const ajouterMedecin = (equipeId, medecinId) =>
  api.post(`/api/equipes/${equipeId}/ajouter-medecin?medecinId=${medecinId}`);

/** Retirer un médecin */
export const retirerMedecin = (equipeId, medecinId) =>
  api.post(`/api/equipes/${equipeId}/retirer-medecin?medecinId=${medecinId}`);

/** Ajouter un patient */
export const ajouterPatient = (equipeId, patientId) =>
  api.post(`/api/equipes/${equipeId}/ajouter-patient?patientId=${patientId}`);

/** Retirer un patient */
export const retirerPatient = (equipeId, patientId) =>
  api.post(`/api/equipes/${equipeId}/retirer-patient?patientId=${patientId}`);

/** Supprimer une équipe */
export const supprimerEquipe = (equipeId) =>
  api.delete(`/api/equipes/${equipeId}`);
