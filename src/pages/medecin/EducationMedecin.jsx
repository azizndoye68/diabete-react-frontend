import React, { useEffect, useState } from "react";
import {
  getContenus,
  createContenu,
  deleteContenu,
} from "../../services/patientService";
import "./EducationMedecin.css";

export default function EducationMedecin() {
  const [contenus, setContenus] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    titre: "",
    type: "PDF",
    url: "",
  });

  const loadContenus = async () => {
    try {
      setLoading(true);
      const data = await getContenus();
      setContenus(data);
    } catch (error) {
      console.error("Erreur chargement contenus", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContenus();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titre || !form.url) return;

    try {
      await createContenu(form);
      setForm({ titre: "", type: "PDF", url: "" });
      loadContenus();
    } catch (error) {
      console.error("Erreur création contenu", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous supprimer ce contenu ?")) return;

    try {
      await deleteContenu(id);
      loadContenus();
    } catch (error) {
      console.error("Erreur suppression", error);
    }
  };

  return (
    <div className="education-container">
      <h2>📚 Contenus éducatifs</h2>

      {/* FORMULAIRE D'AJOUT */}
      <div className="card">
        <h4>➕ Ajouter un contenu éducatif</h4>

        <form onSubmit={handleSubmit} className="form-grid">
          <input
            type="text"
            name="titre"
            placeholder="Titre du contenu"
            value={form.titre}
            onChange={handleChange}
            required
          />

          <select name="type" value={form.type} onChange={handleChange}>
            <option value="PDF">PDF</option>
            <option value="VIDEO">Vidéo</option>
            <option value="ARTICLE">Article</option>
          </select>

          <input
            type="url"
            name="url"
            placeholder="Lien du contenu"
            value={form.url}
            onChange={handleChange}
            required
          />

          <button type="submit">Enregistrer</button>
        </form>
      </div>

      {/* LISTE DES CONTENUS */}
      <div className="card">
        <h4>📋 Liste des contenus</h4>

        {loading ? (
          <p>Chargement...</p>
        ) : contenus.length === 0 ? (
          <p>Aucun contenu disponible</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Titre</th>
                <th>Type</th>
                <th>Date</th>
                <th>Lien</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {contenus.map((c) => (
                <tr key={c.id}>
                  <td>{c.titre}</td>
                  <td>
                    <span className={`badge ${c.type.toLowerCase()}`}>
                      {c.type}
                    </span>
                  </td>
                  <td>{c.datePublication}</td>
                  <td>
                    <a href={c.url} target="_blank" rel="noreferrer">
                      Ouvrir
                    </a>
                  </td>
                  <td>
                    <button
                      className="danger"
                      onClick={() => handleDelete(c.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
