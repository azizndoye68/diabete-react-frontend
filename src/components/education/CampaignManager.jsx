import React, { useEffect, useState } from "react";
import EducationService from "../../services/EducationService";

function CampaignManager() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    titre: "",
    description: "",
    dateDebut: "",
    dateFin: ""
  });

  const load = async () => {
    const res = await EducationService.getCampagnes();
    setList(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await EducationService.addCampagne(form);
    load();
  };

  return (
    <div>
      <h4 className="fw-bold mb-3">Créer une campagne</h4>

      <form className="card p-4 shadow-sm mb-4" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Titre</label>
          <input
            className="form-control"
            value={form.titre}
            onChange={(e) => setForm({ ...form, titre: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label>Description</label>
          <textarea
            className="form-control"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          ></textarea>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label>Date début</label>
            <input
              type="date"
              className="form-control"
              value={form.dateDebut}
              onChange={(e) => setForm({ ...form, dateDebut: e.target.value })}
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Date fin</label>
            <input
              type="date"
              className="form-control"
              value={form.dateFin}
              onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
              required
            />
          </div>
        </div>

        <button className="btn btn-success">Créer</button>
      </form>

      <h4 className="fw-bold mb-3">📢 Campagnes existantes</h4>

      <ul className="list-group">
        {list.map((c) => (
          <li className="list-group-item" key={c.id}>
            <strong>{c.titre}</strong> — {c.dateDebut} → {c.dateFin}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CampaignManager;
