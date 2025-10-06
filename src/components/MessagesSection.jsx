import React, { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import api from "../services/api";

function MessagesSection({ medecinId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/medecin/messages?medecinId=${medecinId}`);
        setMessages(res.data);
      } catch (error) {
        console.error("Erreur chargement messages :", error);
      }
    };
    fetchMessages();
  }, [medecinId]);

  return (
    <div className="p-3 bg-white rounded shadow-sm">
      <h5>Derniers messages</h5>
      <ListGroup variant="flush">
        {messages.length > 0 ? (
          messages.map((m, i) => (
            <ListGroup.Item key={i}>
              <strong>{m.expediteur}</strong> : {m.contenu}
            </ListGroup.Item>
          ))
        ) : (
          <p className="text-muted">Aucun message</p>
        )}
      </ListGroup>
    </div>
  );
}

export default MessagesSection;
