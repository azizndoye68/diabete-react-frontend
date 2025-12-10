import api from "./api";

const EducationService = {
  // contenus éducatifs
  getContenus: () => api.get("/api/contenus"),
  addContenu: (data) => api.post("/api/contenus", data),

  // campagnes
  getCampagnes: () => api.get("/api/campagnes"),
  addCampagne: (data) => api.post("/api/campagnes", data),

  // conseils
  getConseilsByPatient: (patientId) => api.get(`/api/conseils/patient/${patientId}`),
  getConseilsByMedecin: () => api.get("/api/conseils/medecin"),
  addConseil: (data) => api.post("/api/conseils", data),

  // patients depuis medecin-service
  getPatients: () => api.get("/api/medecins/patients")
};

export default EducationService;
