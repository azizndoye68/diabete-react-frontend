import React, { useState, useEffect, useRef, useCallback } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import axios from "axios";

const API_GATEWAY = "http://localhost:8080";
const API_BASE = `${API_GATEWAY}/api/chat`;
const WS_URL = `${API_GATEWAY}/ws`; // WebSocket via Gateway

const MessagesSection = () => {
  const [stompClient, setStompClient] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);
  const messagesEndRef = useRef(null);

  // Récupération utilisateur
  const userId = parseInt(localStorage.getItem("user_id"));
  const username = localStorage.getItem("username");

  // Connexion WebSocket (via useCallback pour éviter ESLint warning)
  const connectWebSocket = useCallback(() => {
    if (!userId || !username) return;

    const socket = new SockJS(WS_URL);
    const client = Stomp.over(socket);

    client.connect(
      { userId: userId.toString(), username },
      () => {
        console.log("✅ WebSocket connecté via API Gateway");
        setConnected(true);
        setStompClient(client);
      },
      (error) => {
        console.error("❌ Erreur WebSocket:", error);
        setConnected(false);
      }
    );

    return client;
  }, [userId, username]);

  // Initialisation WebSocket
  useEffect(() => {
    const client = connectWebSocket();
    return () => {
      if (client && client.connected) client.disconnect();
    };
  }, [connectWebSocket]);

  // Charger les conversations
  useEffect(() => {
    if (!userId) return;

    axios
      .get(`${API_BASE}/conversations/user/${userId}/details`)
      .then((res) => setConversations(res.data))
      .catch((err) => console.error("❌ Erreur chargement conversations:", err));
  }, [userId]);

  // Abonnement aux messages
  useEffect(() => {
    if (!stompClient || !selectedConversation) return;

    const subscription = stompClient.subscribe(
      `/topic/conversation/${selectedConversation.id}`,
      (message) => {
        const receivedMessage = JSON.parse(message.body);
        setMessages((prev) => [...prev, receivedMessage]);
      }
    );

    axios
      .get(`${API_BASE}/conversations/${selectedConversation.id}/messages`, {
        params: { userId },
      })
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("❌ Erreur chargement messages:", err));

    return () => subscription.unsubscribe();
  }, [stompClient, selectedConversation, userId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Recherche utilisateurs
  const searchUsers = useCallback(
    async (query) => {
      if (query.length < 2) {
        setUsers([]);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE}/users/search`, {
          params: { query },
        });
        setUsers(res.data.filter((u) => u.id !== userId));
      } catch (err) {
        console.error("❌ Erreur recherche utilisateurs:", err);
      }
    },
    [userId]
  );

  // Créer conversation privée
  const createPrivateChat = async (otherUserId) => {
    try {
      const res = await axios.post(`${API_BASE}/conversations/private`, null, {
        params: { userId1: userId, userId2: otherUserId },
      });

      const convRes = await axios.get(
        `${API_BASE}/conversations/user/${userId}/details`
      );
      setConversations(convRes.data);

      setSelectedConversation(res.data);
      setShowUserSearch(false);
      setSearchQuery("");
      setUsers([]);
    } catch (err) {
      console.error("❌ Erreur création conversation:", err);
    }
  };

  // Envoyer message
  const sendMessage = () => {
    if (!messageInput.trim() || !stompClient || !selectedConversation) return;

    const messageDto = {
      content: messageInput,
      senderId: userId,
      senderUsername: username,
      conversationId: selectedConversation.id,
    };

    stompClient.send(
      `/app/chat/${selectedConversation.id}`,
      {},
      JSON.stringify(messageDto)
    );

    setMessageInput("");
  };

  // Nom conversation
  const getConversationName = (conv) => {
    if (conv.type === "GROUP") return conv.name;
    const other = conv.participants?.find((p) => p.id !== userId);
    return other ? other.username : "Conversation";
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Arial",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Liste des conversations */}
      <div
        style={{
          width: "300px",
          borderRight: "1px solid #ccc",
          padding: "20px",
          backgroundColor: "white",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ marginBottom: "10px" }}>Messages</h2>
          <div style={{ fontSize: "12px", color: "#666" }}>
            <div>User ID: {userId}</div>
            <div>Username: {username}</div>
          </div>
          <div style={{ marginTop: "10px", marginBottom: "10px" }}>
            <span
              style={{
                display: "inline-block",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: connected ? "#4caf50" : "#f44336",
                marginRight: "8px",
              }}
            ></span>
            {connected ? "Connecté" : "Déconnecté"}
          </div>

          <button
            onClick={() => setShowUserSearch(!showUserSearch)}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginBottom: "10px",
            }}
          >
            ➕ Nouvelle conversation
          </button>

          {showUserSearch && (
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                placeholder="Rechercher un utilisateur..."
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  marginBottom: "5px",
                }}
              />
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => createPrivateChat(user.id)}
                  style={{
                    padding: "8px",
                    cursor: "pointer",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "5px",
                    marginBottom: "5px",
                  }}
                >
                  <strong>{user.username}</strong>
                  <br />
                  <small>{user.email}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
          {conversations.length === 0 && (
            <div
              style={{ textAlign: "center", color: "#999", padding: "20px" }}
            >
              Aucune conversation
            </div>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              style={{
                padding: "12px",
                cursor: "pointer",
                backgroundColor:
                  selectedConversation?.id === conv.id ? "#e3f2fd" : "#fafafa",
                borderRadius: "8px",
                marginBottom: "8px",
                border: "1px solid #e0e0e0",
              }}
            >
              <strong>{getConversationName(conv)}</strong>
              <br />
              <small style={{ color: "#666" }}>
                {conv.type === "GROUP"
                  ? `👥 ${conv.participants?.length || 0} membres`
                  : "💬 Privé"}
              </small>
            </div>
          ))}
        </div>
      </div>

      {/* Zone de chat */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
        }}
      >
        {selectedConversation ? (
          <>
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid #ccc",
                backgroundColor: "#1976d2",
                color: "white",
              }}
            >
              <h2 style={{ margin: 0 }}>
                {getConversationName(selectedConversation)}
              </h2>
              {selectedConversation.participants && (
                <small>
                  {selectedConversation.participants
                    .map((p) => p.username)
                    .join(", ")}
                </small>
              )}
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                backgroundColor: "#f9f9f9",
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    marginBottom: "15px",
                    display: "flex",
                    justifyContent:
                      msg.senderId === userId ? "flex-end" : "flex-start",
                  }}
                >
                  <div style={{ maxWidth: "70%" }}>
                    {msg.senderId !== userId && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginBottom: "3px",
                          marginLeft: "5px",
                        }}
                      >
                        {msg.senderUsername}
                      </div>
                    )}
                    <div
                      style={{
                        padding: "10px 15px",
                        borderRadius: "15px",
                        backgroundColor:
                          msg.senderId === userId ? "#1976d2" : "white",
                        color: msg.senderId === userId ? "white" : "black",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                        wordWrap: "break-word",
                      }}
                    >
                      {msg.content}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#999",
                        marginTop: "3px",
                        textAlign:
                          msg.senderId === userId ? "right" : "left",
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div
              style={{
                padding: "15px 20px",
                borderTop: "1px solid #ccc",
                display: "flex",
                backgroundColor: "white",
              }}
            >
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Tapez votre message..."
                style={{
                  flex: 1,
                  padding: "12px 15px",
                  border: "1px solid #ddd",
                  borderRadius: "25px",
                  marginRight: "10px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!connected || !messageInput.trim()}
                style={{
                  padding: "12px 25px",
                  backgroundColor:
                    connected && messageInput.trim() ? "#1976d2" : "#ccc",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  cursor:
                    connected && messageInput.trim()
                      ? "pointer"
                      : "not-allowed",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                Envoyer
              </button>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>💬</div>
              <p style={{ fontSize: "18px" }}>
                Sélectionnez une conversation ou créez-en une nouvelle
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesSection;
