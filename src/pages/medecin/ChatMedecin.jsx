// src/pages/ChatMedecin.jsx
import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, Button, ListGroup } from "react-bootstrap";
import TopbarMedecin from "../../components/TopbarMedecin";
import api from "../../services/api";
import "./ChatMedecin.css";

function ChatMedecin() {
  const [medecin, setMedecin] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [userType, setUserType] = useState("patient");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Charger le profil médecin
  useEffect(() => {
    const fetchMedecin = async () => {
      try {
        const profileRes = await api.get("/api/auth/profile");
        const userData = profileRes.data;

        const medRes = await api.get(
          `/api/medecins/byUtilisateur/${userData.id}`,
        );
        setMedecin(medRes.data);
      } catch (error) {
        console.error("❌ Erreur profil médecin:", error);
      }
    };

    fetchMedecin();
  }, []);

  // Charger conversations et connecter WebSocket
  useEffect(() => {
    if (medecin) {
      loadConversations();
      loadUsers();
      connectWebSocket();
    }

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medecin]);

  // Auto-scroll messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Charger messages quand conversation change
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const connectWebSocket = () => {
    if (!medecin) return;

    const initWebSocket = () => {
      if (!window.SockJS || !window.Stomp) {
        setTimeout(initWebSocket, 100);
        return;
      }

      const socket = new WebSocket("ws://localhost:8080/ws");
      const client = window.Stomp.over(socket);

      client.debug = () => {};

      client.connect(
        {},
        () => {
          console.log("✅ WebSocket connecté");
          setIsConnected(true);

          // S'abonner aux messages du médecin
          client.subscribe(
            `/topic/medecin/${medecin.id}/messages`,
            (message) => {
              const newMessage = JSON.parse(message.body);
              console.log("📩 Nouveau message reçu:", newMessage);
              handleNewMessage(newMessage);
            },
          );

          stompClientRef.current = client;
        },
        (error) => {
          console.error("❌ Erreur WebSocket:", error);
          setIsConnected(false);
          setTimeout(connectWebSocket, 3000);
        },
      );
    };

    initWebSocket();
  };

  const loadConversations = async () => {
    if (!medecin) return;

    try {
      setLoading(true);
      console.log("🔍 Chargement conversations pour médecin ID:", medecin.id);
      
      // Charger TOUTES les conversations (patient et médecin)
      const response = await api.get(`/api/conversations/medecin/${medecin.id}`);
      
      console.log("✅ Conversations reçues:", response.data);
      console.log("📊 Types de conversations:", response.data.map(c => ({ id: c.id, type: c.type })));
      
      setConversations(response.data);
    } catch (error) {
      console.error("❌ Erreur chargement conversations:", error);
      console.error("Détails:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await api.get(
        `/api/messages/conversation/${conversationId}?page=0&size=100`,
      );
      setMessages(response.data.content.reverse());
    } catch (error) {
      console.error("❌ Erreur chargement messages:", error);
    }
  };

  const handleNewMessage = (newMessage) => {
    console.log("🔄 Traitement nouveau message:", newMessage);
    
    // Ajouter le message à la liste si c'est la conversation active
    if (selectedConversation && newMessage.conversationId === selectedConversation.id) {
      setMessages((prev) => {
        // Éviter les doublons
        const exists = prev.some(msg => msg.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage];
      });
    }

    // Mettre à jour la liste des conversations
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === newMessage.conversationId
          ? {
              ...conv,
              lastMessage: newMessage,
              lastMessageAt: newMessage.createdAt,
            }
          : conv,
      ),
    );
  };

  const sendMessage = async () => {
    if (!selectedConversation || !stompClientRef.current) {
      console.log("❌ Impossible d'envoyer - pas de conversation ou WebSocket");
      return;
    }

    try {
      // Envoyer les fichiers d'abord si présents
      if (selectedFiles.length > 0) {
        await sendFiles();
      }

      // Envoyer le message texte si présent
      if (messageInput.trim()) {
        const message = {
          conversationId: selectedConversation.id,
          senderId: medecin.id,
          senderType: "MEDECIN",
          content: messageInput,
          messageType: "TEXT",
        };

        console.log("📤 Envoi message:", message);
        
        stompClientRef.current.send("/app/chat.send", {}, JSON.stringify(message));

        // Message optimiste
        const optimisticMessage = {
          ...message,
          id: Date.now(),
          senderName: `Dr. ${medecin.prenom} ${medecin.nom}`,
          createdAt: new Date().toISOString(),
        };
        
        setMessages((prev) => [...prev, optimisticMessage]);
        setMessageInput("");
      }

      stopTyping();
    } catch (error) {
      console.error("❌ Erreur envoi message:", error);
    }
  };

  const handleTyping = () => {
    if (!selectedConversation || !stompClientRef.current) return;

    const indicator = {
      conversationId: selectedConversation.id,
      userId: medecin.id,
      userName: `Dr. ${medecin.prenom}`,
      typing: true,
    };
    stompClientRef.current.send(
      "/app/chat.typing",
      {},
      JSON.stringify(indicator),
    );

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, 2000);
  };

  const stopTyping = () => {
    if (!selectedConversation || !stompClientRef.current) return;

    const indicator = {
      conversationId: selectedConversation.id,
      userId: medecin.id,
      userName: `Dr. ${medecin.prenom}`,
      typing: false,
    };
    stompClientRef.current.send(
      "/app/chat.typing",
      {},
      JSON.stringify(indicator),
    );
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const sendFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploadingFile(true);

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("conversationId", selectedConversation.id);
        formData.append("senderId", medecin.id);
        formData.append("senderType", "MEDECIN");
        formData.append("content", `Fichier partagé: ${file.name}`);

        await api.post("/api/messages/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setSelectedFiles([]);
    } catch (error) {
      console.error("❌ Erreur upload:", error);
      alert("Erreur lors de l'envoi des fichiers");
    } finally {
      setUploadingFile(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getConversationTitle = (conv) => {
    if (conv.type === "PATIENT_EQUIPE") {
      // Pour les conversations patient, afficher le nom du patient
      return conv.patientName || "Patient";
    } else {
      // Pour les conversations médecin-médecin, afficher le nom de l'autre médecin
      return conv.otherMedecinName || "Médecin";
    }
  };

  const getConversationSubtitle = (conv) => {
    // Afficher le dernier message avec le nom de l'expéditeur
    if (!conv.lastMessage) {
      if (conv.type === "PATIENT_EQUIPE") {
        return "Aucun message";
      } else {
        return "Conversation privée";
      }
    }

    const senderName = conv.lastMessage.senderName;
    const content = conv.lastMessage.content || "";
    
    // Tronquer le message s'il est trop long
    const maxLength = 30;
    const truncatedContent = content.length > maxLength 
      ? content.substring(0, maxLength) + "..." 
      : content;
    
    // Si on a un nom d'expéditeur, afficher "Nom: message", sinon juste le message
    if (senderName) {
      return `${senderName}: ${truncatedContent}`;
    } else {
      return truncatedContent;
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    getConversationTitle(conv).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatMessageTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (diffInHours < 48) {
        return "Hier";
      } else {
        return date.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
        });
      }
    } catch (error) {
      return "";
    }
  };

  const isMyMessage = (message) => {
    return message.senderId === medecin?.id && message.senderType === "MEDECIN";
  };

  const loadUsers = async () => {
    try {
      const patientsRes = await api.get(
        `/api/patients/medecin/${medecin.id}/visibles`,
      );
      setPatients(patientsRes.data);
      console.log("👥 Patients chargés:", patientsRes.data.length);

      const medecinsRes = await api.get("/api/medecins");
      const autresMedecins = medecinsRes.data.filter(
        (m) => m.id !== medecin.id,
      );
      setMedecins(autresMedecins);
      console.log("👨‍⚕️ Médecins chargés:", autresMedecins.length);
    } catch (error) {
      console.error("❌ Erreur chargement utilisateurs:", error);
    }
  };

  const createConversationWithUser = async (user, type) => {
    try {
      let conversation;

      if (type === "patient") {
        const response = await api.post(
          `/api/conversations/patient/${user.id}`,
        );
        conversation = response.data;
      } else {
        const response = await api.post(
          "/api/conversations/medecin-to-medecin",
          {
            requestingMedecinId: medecin.id,
            targetMedecinId: user.id,
          },
        );
        conversation = response.data;
      }

      await loadConversations();
      setSelectedConversation(conversation);
      setShowNewConversation(false);
    } catch (error) {
      console.error("❌ Erreur création conversation:", error);
      alert("Erreur lors de la création de la conversation");
    }
  };

  return (
    <div className="chat-medecin-container">
      <TopbarMedecin user={medecin} />

      <div className="chat-content">
        <Container fluid className="h-100">
          <Row className="h-100">
            {/* Sidebar */}
            <Col md={4} className="chat-sidebar p-0">
              <div className="sidebar-header p-3 border-bottom">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Messages</h5>
                  <button
                    className="btn-new-chat"
                    onClick={() => setShowNewConversation(true)}
                    title="Nouvelle conversation"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                </div>
                <Form.Control
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-2"
                />
                <div className="d-flex align-items-center gap-2">
                  <span
                    className={`status-dot ${isConnected ? "online" : "offline"}`}
                  ></span>
                  <small className="text-muted">
                    {isConnected ? "En ligne" : "Hors ligne"}
                  </small>
                </div>
              </div>

              <div className="conversations-list">
                {loading ? (
                  <div className="text-center p-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center p-4">
                    <div className="text-muted">
                      <i className="bi bi-inbox" style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}></i>
                      <p className="fw-bold">Aucune conversation</p>
                      <p className="small">Cliquez sur l'icône crayon pour commencer</p>
                    </div>
                  </div>
                ) : (
                  <ListGroup variant="flush">
                    {filteredConversations.map((conv) => (
                      <ListGroup.Item
                        key={conv.id}
                        action
                        active={selectedConversation?.id === conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className="conversation-item"
                      >
                        <div className="d-flex align-items-center">
                          <div className="conversation-avatar me-3">
                            {conv.type === "PATIENT_EQUIPE" ? "👤" : "👨‍⚕️"}
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <strong>{getConversationTitle(conv)}</strong>
                              <small className="text-muted">
                                {conv.lastMessageAt && formatMessageTime(conv.lastMessageAt)}
                              </small>
                            </div>
                            <small className="text-muted text-truncate d-block" style={{ maxWidth: "200px" }}>
                              {getConversationSubtitle(conv)}
                            </small>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </div>
            </Col>

            {/* Zone messages */}
            <Col md={8} className="chat-main p-0 d-flex flex-column">
              {!selectedConversation ? (
                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                  <i className="bi bi-chat-dots" style={{ fontSize: "4rem", color: "#ccc" }}></i>
                  <h4 className="mt-3 text-muted">Sélectionnez une conversation</h4>
                  <p className="text-muted">Choisissez un patient ou un collègue</p>
                </div>
              ) : (
                <>
                  <div className="chat-header p-3 border-bottom bg-light">
                    <div className="d-flex align-items-center">
                      <div className="conversation-avatar me-3">
                        {selectedConversation.type === "PATIENT_EQUIPE" ? "👤" : "👨‍⚕️"}
                      </div>
                      <div>
                        <h5 className="mb-0">{getConversationTitle(selectedConversation)}</h5>
                        <small className="text-muted">
                          {selectedConversation.type === "PATIENT_EQUIPE" ? "Patient" : "Conversation privée"}
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="messages-container flex-grow-1 p-3">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted">
                        Aucun message. Commencez la conversation !
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        <div
                          key={message.id || index}
                          className={`message mb-3 ${isMyMessage(message) ? "message-sent" : "message-received"}`}
                        >
                          <div className="message-bubble">
                            {/* Toujours afficher le nom de l'expéditeur */}
                            <div className={`message-sender fw-bold mb-1 ${isMyMessage(message) ? "text-white" : "text-primary"}`} style={{ fontSize: "0.85rem" }}>
                              {message.senderName}
                            </div>

                            {message.messageType === "TEXT" ? (
                              <div className="message-text">{message.content}</div>
                            ) : (
                              <div className="message-file d-flex align-items-center gap-2 p-2 bg-light rounded">
                                <i className="bi bi-file-earmark"></i>
                                <div className="flex-grow-1">
                                  <div className="fw-bold">{message.fileName}</div>
                                  <small>{(message.fileSize / 1024).toFixed(1)} KB</small>
                                </div>
                                <a
                                  href={`http://localhost:8080${message.fileUrl}`}
                                  download
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  <i className="bi bi-download"></i>
                                </a>
                              </div>
                            )}

                            <div className="message-time text-muted" style={{ fontSize: "0.75rem" }}>
                              {formatMessageTime(message.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="chat-input p-3 border-top bg-light">
                    {selectedFiles.length > 0 && (
                      <div className="selected-files mb-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="file-preview d-flex align-items-center gap-2 p-2 mb-1 bg-white rounded">
                            <i className="bi bi-file-earmark"></i>
                            <span className="flex-grow-1 text-truncate">{file.name}</span>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeFile(index)}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <Form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
                      <div className="d-flex gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          style={{ display: "none" }}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          multiple
                        />

                        <Button
                          variant="outline-secondary"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingFile}
                        >
                          <i className="bi bi-paperclip"></i>
                        </Button>

                        <Form.Control
                          type="text"
                          placeholder="Tapez votre message..."
                          value={messageInput}
                          onChange={(e) => {
                            setMessageInput(e.target.value);
                            handleTyping();
                          }}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                            }
                          }}
                        />

                        <Button
                          variant="primary"
                          type="submit"
                          disabled={(!messageInput.trim() && selectedFiles.length === 0) || !isConnected || uploadingFile}
                        >
                          {uploadingFile ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <i className="bi bi-send"></i>
                          )}
                        </Button>
                      </div>
                    </Form>
                  </div>
                </>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      {/* Modal */}
      {showNewConversation && (
        <div className="modal-overlay" onClick={() => setShowNewConversation(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h5>💬 Nouvelle Conversation</h5>
              <button className="btn-close-custom" onClick={() => setShowNewConversation(false)}>
                ×
              </button>
            </div>

            <div className="modal-body-custom">
              <div className="user-type-selector mb-4">
                <button
                  className={`type-btn ${userType === "patient" ? "active" : ""}`}
                  onClick={() => setUserType("patient")}
                >
                  <i className="bi bi-person-fill"></i>
                  <span>Patients</span>
                </button>
                <button
                  className={`type-btn ${userType === "medecin" ? "active" : ""}`}
                  onClick={() => setUserType("medecin")}
                >
                  <i className="bi bi-person-badge"></i>
                  <span>Médecins</span>
                </button>
              </div>

              <div className="users-list-modal">
                {userType === "patient" ? (
                  patients.length === 0 ? (
                    <p className="text-muted text-center py-4">Aucun patient disponible</p>
                  ) : (
                    patients.map((patient) => (
                      <div
                        key={patient.id}
                        className="user-item-modal"
                        onClick={() => createConversationWithUser(patient, "patient")}
                      >
                        <div className="user-avatar-modal">👤</div>
                        <div className="user-info-modal">
                          <div className="user-name-modal">{patient.prenom} {patient.nom}</div>
                          <small className="text-muted">Dossier: {patient.numeroDossier}</small>
                        </div>
                        <i className="bi bi-chevron-right"></i>
                      </div>
                    ))
                  )
                ) : (
                  medecins.length === 0 ? (
                    <p className="text-muted text-center py-4">Aucun médecin disponible</p>
                  ) : (
                    medecins.map((med) => (
                      <div
                        key={med.id}
                        className="user-item-modal"
                        onClick={() => createConversationWithUser(med, "medecin")}
                      >
                        <div className="user-avatar-modal">👨‍⚕️</div>
                        <div className="user-info-modal">
                          <div className="user-name-modal">Dr. {med.prenom} {med.nom}</div>
                          <small className="text-muted">{med.specialite || "Médecin"}</small>
                        </div>
                        <i className="bi bi-chevron-right"></i>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatMedecin;