// src/pages/medecin/AddMemberModal.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Modal, Button, Form, InputGroup, Spinner, Card, Badge } from "react-bootstrap";
import * as medecinService from "../../services/medecinService";
import "./AddMemberModal.css";

export default function AddMemberModal({
  show,
  onHide,
  equipeId,
  proprietaireId,
  existingIds = [],
  onAdded,
}) {
  const [medecins, setMedecins] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(null);

  const excludedIds = useMemo(() => existingIds, [existingIds]);

  useEffect(() => {
    if (!show) return;

    const load = async () => {
      setLoading(true);
      try {
        const all = await medecinService.getAllMedecins();
        const disponibles = (all || []).filter(
          (m) => !excludedIds.includes(m.id)
        );
        setMedecins(disponibles);
      } catch (e) {
        console.error("Erreur chargement médecins :", e);
        setMedecins([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [show, excludedIds]);

  const filtered = medecins.filter((m) =>
    `${m.prenom} ${m.nom} ${m.specialite || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (medecinId) => {
    setAdding(medecinId);
    try {
      await medecinService.ajouterMedecinEquipe(
        equipeId,
        medecinId,
        proprietaireId
      );

      const nouveauMed = await medecinService.getMedecinById(medecinId);

      setMedecins((prev) => prev.filter((m) => m.id !== medecinId));

      if (onAdded) onAdded(nouveauMed);
      
      // Fermer la modal après ajout
      setTimeout(() => {
        setAdding(null);
        onHide();
      }, 500);
    } catch (err) {
      console.error("Erreur ajout médecin :", err);
      alert(err?.response?.data?.message || "Ajout impossible.");
      setAdding(null);
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg" 
      centered
      className="add-member-modal"
    >
      <Modal.Header closeButton className="modal-header-custom">
        <div className="modal-header-content">
          <div className="modal-icon">
            <i className="bi bi-person-plus-fill"></i>
          </div>
          <div>
            <Modal.Title className="modal-title-custom">
              Ajouter un médecin
            </Modal.Title>
            <p className="modal-subtitle">
              Sélectionnez un médecin à ajouter à votre équipe
            </p>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="modal-body-custom">
        {/* Barre de recherche */}
        <div className="search-section">
          <InputGroup className="search-input-group">
            <InputGroup.Text className="search-icon">
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              className="search-input"
              placeholder="Rechercher par nom, prénom ou spécialité..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <Button
                variant="link"
                className="clear-search"
                onClick={() => setSearch("")}
              >
                <i className="bi bi-x-lg"></i>
              </Button>
            )}
          </InputGroup>
        </div>

        {/* Liste des médecins */}
        {loading ? (
          <div className="loading-state">
            <Spinner animation="border" variant="primary" />
            <p>Chargement des médecins...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="bi bi-inbox"></i>
            </div>
            <h5>Aucun médecin disponible</h5>
            <p className="text-muted">
              {search 
                ? "Aucun résultat pour votre recherche" 
                : "Tous les médecins sont déjà dans l'équipe"}
            </p>
          </div>
        ) : (
          <div className="medecins-grid">
            {filtered.map((m) => (
              <Card key={m.id} className="medecin-card">
                <Card.Body>
                  <div className="medecin-avatar">
                    <i className="bi bi-person-circle"></i>
                  </div>
                  
                  <div className="medecin-info">
                    <h6 className="medecin-name">
                      Dr. {m.prenom} {m.nom}
                    </h6>
                    
                    {m.specialite && (
                      <Badge bg="info" className="specialite-badge">
                        <i className="bi bi-briefcase me-1"></i>
                        {m.specialite}
                      </Badge>
                    )}
                    
                    <div className="medecin-contact">
                      {m.telephone && (
                        <span>
                          <i className="bi bi-telephone"></i>
                          {m.telephone}
                        </span>
                      )}
                      {m.email && (
                        <span>
                          <i className="bi bi-envelope"></i>
                          {m.email}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    className="btn-add-medecin"
                    onClick={() => handleAdd(m.id)}
                    disabled={adding === m.id}
                  >
                    {adding === m.id ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Ajout...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-lg me-2"></i>
                        Ajouter
                      </>
                    )}
                  </Button>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="modal-footer-custom">
        <Button variant="light" onClick={onHide} className="btn-cancel">
          <i className="bi bi-x-circle me-2"></i>
          Annuler
        </Button>
      </Modal.Footer>
    </Modal>
  );
}