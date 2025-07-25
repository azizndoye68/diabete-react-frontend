// src/components/AideModal.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function AideModal({ show, onHide }) {  // 🔁 ici on utilise bien "onHide"
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton style={{ backgroundColor: '#157347', color: 'white' }}>
        <Modal.Title>Besoin d'aide ?</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <p>Retrouvez toute l'aide en ligne à l'adresse suivante :</p>
        <a href="https://help.suividiabete.sn/" target="_blank" rel="noopener noreferrer">
          https://help.suividiabete.sn/
        </a>

        <hr />

        <p>Vous pouvez également nous contacter :</p>
        <p>
          <i className="bi bi-telephone-fill me-2"></i>Par téléphone au <strong>+221 77 123 45 67</strong>
        </p>
        <p>
          <i className="bi bi-envelope-fill me-2"></i>Par email à l'adresse <br />
          <a href="mailto:support@mydiabby.com">contact@diabete-platforme.sn</a>
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-success" onClick={onHide}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AideModal;
