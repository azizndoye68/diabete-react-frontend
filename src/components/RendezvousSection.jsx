import React, { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import api from "../services/api";

function RendezvousSection({ medecinId }) {
  const [rdv, setRdv] = useState([]);

  useEffect(() => {
    const fetchRdv = async () => {
      try {
        const res = await api.get(`/medecin/rdv?medecinId=${medecinId}`);
        setRdv(res.data);
      } catch (error) {
        console.error("Erreur chargement rendez-vous :", error);
      }
    };
    fetchRdv();
  }, [medecinId]);

  return (
    <div className="p-3 bg-white rounded shadow-sm">
      <h5>Rendez-vous à venir</h5>
      <ListGroup variant="flush">
        {rdv.length > 0 ? (
          rdv.map((r, i) => (
            <ListGroup.Item key={i}>
              {r.date} — <strong>{r.patientNom}</strong> ({r.type})
            </ListGroup.Item>
          ))
        ) : (
          <p className="text-muted">Aucun rendez-vous</p>
        )}
      </ListGroup>
    </div>
  );
}

export default RendezvousSection;
