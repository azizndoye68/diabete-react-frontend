import React, { useEffect, useState } from "react";
import EducationService from "../../services/EducationService";
import api from "../../services/api";

function ConseilManager() {
  const [patients, setPatients] = useState([]);
  const [medecinId, setMedecinId] = useState(null);
  const [form, setForm] = useState({
    patientId: "",
    titre: "",
    contenu: ""
  });
  const [conseils, setConseils] = useState([]);

  // ---------------------------
  // 1️⃣ Récupérer le profil
  // ---------------------------
  useEffect(() => {
    const fetchMedecin = async () => {
      try {
        const res = await api.get("/api/auth/profile");
        setMedecinId(res.data.id);
      } catch (error) {
        console.error("Erreur profil :", error);
        alert("Erreur lors de la récupération du profil.");
      }
    };
    fetchMedecin();
  }, []);

  // ---------------------------
  // 2️⃣ Récupérer la liste des patients
  // ---------------------------
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await EducationService.getPatients();
        setPatients(res.data);
      } catch (error) {
        console.error("Erreur patients :", error);
        alert("Impossible de récupérer la liste des patients.");
      }
    };
    fetchPatients();
  }, []);

  // ---------------------------
  // 3️⃣ Charger les conseils quand le patient change
  // ---------------------------
  useEffect(() => {
    const fetchConseils = async () => {
      if (!form.patientId) {
        setConseils([]); // Pas de patient → pas de conseils affichés
        return;
      }

      try {
        const res = await EducationService.getConseilsByPatient(form.patientId);
        setConseils(res.data);
      } catch (error) {
        console.error("Erreur conseils :", error);
        alert("Impossible de récupérer les conseils du patient.");
      }
    };

    fetchConseils();
  }, [form.patientId]);

  // ---------------------------
  // 4️⃣ Envoyer un conseil
  // ---------------------------
  const send = async (e) => {
    e.preventDefault();

    if (!medecinId) {
      alert("ID médecin introuvable.");
      return;
    }

    if (!form.patientId) {
      alert("Veuillez sélectionner un patient.");
      return;
    }

    try {
      await EducationService.addConseil(form, medecinId);
      alert("Conseil envoyé !");

      setForm((prev) => ({
        ...prev,
        titre: "",
        contenu: ""
      }));

      // Rafraîchir la liste après ajout
      const res = await EducationService.getConseilsByPatient(form.patientId);
      setConseils(res.data);
    } catch (error) {
      console.error("Erreur envoi :", error);
      alert("Erreur lors de l'envoi du conseil.");
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-3">Envoyer un conseil personnalisé</h4>

      {/* FORMULAIRE */}
      <form className="card p-4 shadow-sm mb-4" onSubmit={send}>
        
        {/* Patient */}
        <div className="mb-3">
          <label>Patient</label>
          <select
            className="form-select"
            value={form.patientId}
            onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            required
          >
            <option value="">Sélectionner un patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.prenom} {p.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Titre */}
        <div className="mb-3">
          <label>Titre</label>
          <input
            className="form-control"
            value={form.titre}
            onChange={(e) => setForm({ ...form, titre: e.target.value })}
            required
          />
        </div>

        {/* Contenu */}
        <div className="mb-3">
          <label>texte</label>
          <textarea
            className="form-control"
            rows="4"
            value={form.texte}
            onChange={(e) => setForm({ ...form, texte: e.target.value })}
            required
          ></textarea>
        </div>

        <button className="btn btn-success">Envoyer</button>
      </form>

      {/* LISTE DES CONSEILS */}
      {conseils.length > 0 && (
        <div className="card p-4 shadow-sm">
          <h5>Conseils pour ce patient :</h5>
          <ul className="list-group list-group-flush">
            {conseils.map((c) => (
              <li key={c.id} className="list-group-item">
                <strong>{c.titre}</strong>
                <p>{c.contenu ?? c.texte}</p>
                <small>
                  Date : {new Date(c.dateCreation).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ConseilManager;
