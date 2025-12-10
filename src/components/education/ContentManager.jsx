import React, { useEffect, useState } from "react";
import EducationService from "../../services/EducationService";

function ContentManager() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    titre: "",
    description: "",
    type: "PDF",
    url: ""
  });

  const loadContent = async () => {
    const res = await EducationService.getContenus();
    setList(res.data);
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await EducationService.addContenu(form);
    loadContent();
    setForm({ titre: "", description: "", type: "PDF", url: "" });
  };

  return (
    <div>
      <h4 className="fw-bold mb-3">Ajouter un contenu éducatif</h4>

      <form className="card p-4 shadow-sm mb-4" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Titre</label>
            <input
              className="form-control"
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option>PDF</option>
              <option>VIDÉO</option>
              <option>ARTICLE</option>
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label>Description</label>
          <textarea
            className="form-control"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label>URL du contenu</label>
          <input
            className="form-control"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            required
          />
        </div>

        <button className="btn btn-success">Ajouter</button>
      </form>

      <h4 className="fw-bold mb-3">📂 Liste des contenus</h4>

      <div className="row">
        {list.map((item) => (
          <div className="col-md-4 mb-3" key={item.id}>
            <div className="card p-3 shadow-sm">
              <h5>{item.titre}</h5>
              <p>{item.description}</p>
              <span className="badge bg-success">{item.type}</span>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-primary mt-2"
            >
                Ouvrir
            </a>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContentManager;
