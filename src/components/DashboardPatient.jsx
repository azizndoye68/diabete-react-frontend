// src/pages/DashboardPatient.jsx
import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SidebarPatient from '../components/SidebarPatient';

function DashboardPatient() {
  const navigate = useNavigate();

  return (
    <Row className="m-0 vh-100">
      {/* Sidebar réutilisable */}
      <SidebarPatient />

      {/* Contenu principal */}
      <Col md={{ span: 9, offset: 3 }} className="content p-5 overflow-auto">
        <h3 className="mb-4">Aujourd'hui - {new Date().toLocaleDateString('fr-FR')}</h3>

        <Card className="p-4 text-center shadow">
          <p>Ajouter les données de la journée</p>
          <Button variant="outline-success" size="lg" onClick={() => navigate('/ajouter-donnees')}>
            <i className="bi bi-plus-circle"></i> Ajouter
          </Button>
        </Card>
      </Col>
    </Row>
  );
}

export default DashboardPatient;
