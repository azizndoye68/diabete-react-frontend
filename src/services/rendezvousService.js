import api from "./api";

const RendezVousService = {
  getByPatient: async (patientId) => {
    const res = await api.get(`/api/rendezvous/patient/${patientId}`);
    return res.data;
  },
  getByMedecin: async (medecinId) => {
    const res = await api.get(`/api/rendezvous/medecin/${medecinId}`);
    return res.data;
  },
  create: async (rendezVousData) => {
    const res = await api.post(`/api/rendezvous`, rendezVousData);
    return res.data;
  },
  updateStatut: async (id, statut) => {
    const res = await api.put(`/api/rendezvous/${id}/statut?statut=${statut}`);
    return res.data;
  },
  // ✅ Nouvelle méthode : modifier un rendez-vous (date, motif, statut)
  update: async (id, rendezVousData) => {
    const res = await api.put(`/api/rendezvous/${id}`, rendezVousData);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/api/rendezvous/${id}`);
    return res.data;
  },
};

export default RendezVousService;
