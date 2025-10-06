// src/pages/Messagerie.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Card, Button, Form, ListGroup } from "react-bootstrap";
import SidebarMedecin from "../components/SidebarMedecin"; // ou SidebarPatient selon le rôle
import api from "../services/api";
import "./Messagerie.css";

function Messagerie({ destinataireId }) {
  const [messages, setMessages] = useState([]);
  const [contenu, setContenu] = useState("");
  const [user, setUser] = useState(null);

  // Récupération du profil
  useEffect(() => {
    api.get("/auth/profile").then((res) => setUser(res.data));
  }, []);

  // Fonction pour charger la conversation
  const chargerConversation = useCallback(() => {
    if (!user) return;
    api.get(`/messages/conversation/${user.id}/${destinataireId}`)
       .then(res => setMessages(res.data))
       .catch(err => console.error(err));
  }, [user, destinataireId]);

  // useEffect pour rafraîchir la conversation toutes les 3 secondes
  useEffect(() => {
    if (user) {
      chargerConversation();
      const interval = setInterval(chargerConversation, 3000);
      return () => clearInterval(interval);
    }
  }, [user, chargerConversation]);

  // Envoi d'un message
  const envoyerMessage = (e) => {
    e.preventDefault();
    if (!contenu.trim()) return;

    api.post("/messages/envoyer", {
      expediteurId: user.id,
      destinataireId: destinataireId,
      contenu
    })
    .then(() => {
      setContenu("");
      chargerConversation();
    })
    .catch(err => console.error(err));
  };

  return (
    <div className="messagerie d-flex">
      <SidebarMedecin user={user} />

      <div className="messagerie-content flex-grow-1 p-4">
        <Card className="chat-box shadow-sm">
          <Card.Body>
            <ListGroup className="chat-messages">
              {messages.map((m, i) => (
                <ListGroup.Item
                  key={i}
                  className={m.expediteurId === user?.id ? "message-moi" : "message-autre"}
                >
                  <strong>{m.expediteurId === user?.id ? "Moi" : "Lui"}</strong> : {m.contenu}
                  <br />
                  <small className="text-muted">{new Date(m.dateEnvoi).toLocaleString()}</small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>

          <Card.Footer>
            <Form onSubmit={envoyerMessage} className="d-flex">
              <Form.Control
                type="text"
                value={contenu}
                onChange={(e) => setContenu(e.target.value)}
                placeholder="Écrire un message..."
              />
              <Button type="submit" className="ms-2">Envoyer</Button>
            </Form>
          </Card.Footer>
        </Card>
      </div>
    </div>
  );
}

export default Messagerie;
