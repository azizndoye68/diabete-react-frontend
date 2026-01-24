// src/pages/ChatPatient.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import api from '../../services/api';
import './ChatPatient.css';

function ChatPatient() {
  const [patient, setPatient] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [equipeInfo, setEquipeInfo] = useState(null);

  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Charger le profil patient
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const profileRes = await api.get('/api/auth/profile');
        const userData = profileRes.data;

        const patientRes = await api.get(`/api/patients/byUtilisateur/${userData.id}`);
        setPatient(patientRes.data);
      } catch (error) {
        console.error('❌ Erreur profil patient:', error);
      }
    };

    fetchPatient();
  }, []);

  // Charger conversation et connecter WebSocket
  useEffect(() => {
    if (patient) {
      loadConversation();
      connectWebSocket();
    }

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient]);

  // Auto-scroll messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Charger messages quand conversation change
  useEffect(() => {
    if (conversation) {
      loadMessages(conversation.id);
      loadEquipeInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation]);

  const connectWebSocket = () => {
    if (!patient) return;

    const initWebSocket = () => {
      if (!window.SockJS || !window.Stomp) {
        setTimeout(initWebSocket, 100);
        return;
      }

      const socket = new WebSocket("ws://localhost:8080/ws");
      const client = window.Stomp.over(socket);

      client.connect({}, () => {
        console.log('✅ WebSocket connecté');
        setIsConnected(true);

        client.subscribe(`/topic/patient/${patient.id}/messages`, (message) => {
          const newMessage = JSON.parse(message.body);
          handleNewMessage(newMessage);
        });

        stompClientRef.current = client;
      }, (error) => {
        console.error('❌ Erreur WebSocket:', error);
        setIsConnected(false);
        setTimeout(connectWebSocket, 3000);
      });
    };

    initWebSocket();
  };

  const loadConversation = async () => {
    if (!patient) return;

    try {
      setLoading(true);
      console.log('🔍 Chargement conversation pour patient:', patient.id);

      // Créer ou récupérer la conversation
      const response = await api.post(`/api/conversations/patient/${patient.id}`);
      setConversation(response.data);
      console.log('✅ Conversation chargée:', response.data);
    } catch (error) {
      console.error('❌ Erreur chargement conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await api.get(`/api/messages/conversation/${conversationId}?page=0&size=100`);
      setMessages(response.data.content.reverse());
    } catch (error) {
      console.error('❌ Erreur chargement messages:', error);
    }
  };

  const loadEquipeInfo = async () => {
    if (!patient.medecinId) return;

    try {
      const response = await api.get(`/api/medecins/${patient.medecinId}/equipe`);
      setEquipeInfo(response.data);
      console.log('👨‍⚕️ Équipe médicale:', response.data);
    } catch (error) {
      console.error('❌ Erreur chargement équipe:', error);
    }
  };

  const handleNewMessage = (newMessage) => {
    if (conversation && newMessage.conversationId === conversation.id) {
      setMessages(prev => [...prev, newMessage]);
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !conversation || !stompClientRef.current) {
      console.log('❌ Conditions non remplies pour envoyer');
      return;
    }

    console.log('📤 Envoi message...', messageInput);

    const message = {
      conversationId: conversation.id,
      senderId: patient.id,
      senderType: 'PATIENT',
      content: messageInput,
      messageType: 'TEXT'
    };

    stompClientRef.current.send('/app/chat.send', {}, JSON.stringify(message));

    const optimisticMessage = {
      ...message,
      id: Date.now(),
      senderName: `${patient.prenom} ${patient.nom}`,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMessage]);

    setMessageInput('');
    stopTyping();
  };

  const handleTyping = () => {
    if (!conversation || !stompClientRef.current) return;

    const indicator = {
      conversationId: conversation.id,
      userId: patient.id,
      userName: patient.prenom,
      typing: true
    };
    stompClientRef.current.send('/app/chat.typing', {}, JSON.stringify(indicator));

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, 2000);
  };

  const stopTyping = () => {
    if (!conversation || !stompClientRef.current) return;

    const indicator = {
      conversationId: conversation.id,
      userId: patient.id,
      userName: patient.prenom,
      typing: false
    };
    stompClientRef.current.send('/app/chat.typing', {}, JSON.stringify(indicator));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !conversation) return;

    setUploadingFile(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversation.id);
    formData.append('senderId', patient.id);
    formData.append('senderType', 'PATIENT');
    formData.append('content', `Fichier partagé: ${file.name}`);

    try {
      await api.post('/api/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      console.error('❌ Erreur upload:', error);
      alert('Erreur lors de l\'envoi du fichier');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 48) {
        return 'Hier';
      } else {
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      }
    } catch (error) {
      return '';
    }
  };

  const isMyMessage = (message) => {
    return message.senderId === patient?.id;
  };

  if (loading) {
    return (
      <div className="chat-patient-container">
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="text-muted">Chargement de votre espace de discussion...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient?.medecinId) {
    return (
      <div className="chat-patient-container">
        <Container className="h-100 d-flex align-items-center justify-content-center">
          <Alert variant="warning" className="text-center" style={{ maxWidth: '500px' }}>
            <Alert.Heading>
              <i className="bi bi-exclamation-triangle"></i> Aucun médecin référent
            </Alert.Heading>
            <p>
              Vous n'avez pas encore de médecin référent. 
              Veuillez contacter l'administration pour être rattaché à un médecin.
            </p>
            <hr />
            <p className="mb-0">
              <small>Une fois rattaché, vous pourrez communiquer avec votre équipe médicale.</small>
            </p>
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="chat-patient-container">
      {/* Header */}
      <div className="chat-patient-header">
        <Container>
          <Row className="align-items-center">
            <Col>
              <h4 className="mb-1">
                <i className="bi bi-chat-heart"></i> Messages avec mon équipe médicale
              </h4>
              <small className="text-muted">
                <span className={`status-indicator ${isConnected ? 'online' : 'offline'}`}></span>
                {isConnected ? 'Connecté' : 'Hors ligne'}
              </small>
            </Col>
            <Col xs="auto">
              {equipeInfo && (
                <div className="text-end">
                  <small className="text-muted d-block">Votre équipe soignante :</small>
                  <strong>{equipeInfo.membres?.length + 1 || 1} médecin(s)</strong>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      {/* Zone principale */}
      <Container className="chat-patient-content">
        <Row className="h-100">
          <Col lg={8} className="mx-auto h-100 d-flex flex-column">
            {/* Carte équipe médicale */}
            {equipeInfo && (
              <Card className="mb-3 equipe-card">
                <Card.Body className="p-3">
                  <h6 className="mb-2">
                    <i className="bi bi-people-fill text-primary"></i> Votre équipe médicale
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {equipeInfo.membres?.map((medecin, index) => (
                      <div key={index} className="medecin-badge">
                        <i className="bi bi-person-circle"></i>
                        <span>Dr. {medecin.prenom} {medecin.nom}</span>
                        {medecin.specialite && (
                          <small className="text-muted">• {medecin.specialite}</small>
                        )}
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Messages */}
            <Card className="flex-grow-1 d-flex flex-column chat-card">
              <Card.Body className="messages-container p-3">
                {messages.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <i className="bi bi-chat-dots" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}></i>
                    <p className="mb-2">Aucun message pour le moment</p>
                    <small>Envoyez un message à votre équipe médicale pour commencer</small>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={`message mb-3 ${isMyMessage(message) ? 'message-sent' : 'message-received'}`}
                    >
                      <div className="message-bubble">
                        {!isMyMessage(message) && (
                          <div className="message-sender">
                            <i className="bi bi-person-circle"></i>
                            {message.senderName}
                          </div>
                        )}

                        {message.messageType === 'TEXT' ? (
                          <div className="message-text">{message.content}</div>
                        ) : (
                          <div className="message-file">
                            <i className="bi bi-file-earmark-text"></i>
                            <div className="flex-grow-1">
                              <div className="file-name">{message.fileName}</div>
                              <small className="file-size">
                                {(message.fileSize / 1024).toFixed(1)} KB
                              </small>
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

                        <div className="message-time">
                          {formatMessageTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </Card.Body>

              {/* Input */}
              <Card.Footer className="chat-input-footer">
                <Form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
                  <div className="input-group">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />

                    <Button
                      variant="outline-secondary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile}
                      className="attach-btn"
                    >
                      <i className="bi bi-paperclip"></i>
                    </Button>

                    <Form.Control
                      type="text"
                      placeholder="Tapez votre message à votre équipe médicale..."
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="message-input"
                    />

                    <Button
                      variant="primary"
                      type="submit"
                      disabled={!messageInput.trim() || !conversation || !isConnected}
                      className="send-btn"
                    >
                      <i className="bi bi-send-fill"></i>
                      <span className="d-none d-md-inline ms-2">Envoyer</span>
                    </Button>
                  </div>

                  {uploadingFile && (
                    <small className="text-muted d-block mt-2">
                      <i className="bi bi-hourglass-split"></i> Envoi du fichier en cours...
                    </small>
                  )}
                </Form>
              </Card.Footer>
            </Card>

            {/* Info helper */}
            <div className="text-center mt-3">
              <small className="text-muted">
                <i className="bi bi-shield-check"></i> Vos messages sont sécurisés et visibles uniquement par votre équipe médicale
              </small>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ChatPatient;