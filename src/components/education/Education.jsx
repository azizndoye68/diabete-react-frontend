import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import SidebarPatient from '../components/SidebarPatient';
import api from '../../services/api';
import EducationService from '../../services/EducationService';

function Education() {

  const [patientId, setPatientId] = useState(null);
  const [contenus, setContenus] = useState([]);
  const [campagnes, setCampagnes] = useState([]);
  const [conseils, setConseils] = useState([]);

  // 🔹 1. Récupérer le patient connecté
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await api.get("/api/auth/profile");
        setPatientId(res.data.id);
      } catch (error) {
        console.error("Erreur profil patient :", error);
      }
    };
    fetchPatient();
  }, []);

  // 🔹 2. Charger les contenus éducatifs
  useEffect(() => {
    const fetchContenus = async () => {
      try {
        const res = await EducationService.getContenus();
        setContenus(res.data);
      } catch (error) {
        console.error("Erreur contenus :", error);
      }
    };
    fetchContenus();
  }, []);

  // 🔹 3. Charger les campagnes
  useEffect(() => {
    const fetchCampagnes = async () => {
      try {
        const res = await EducationService.getCampagnes();
        setCampagnes(res.data);
      } catch (error) {
        console.error("Erreur campagnes :", error);
      }
    };
    fetchCampagnes();
  }, []);

  // 🔹 4. Charger les conseils personnalisés
  useEffect(() => {
    if (!patientId) return;

    const fetchConseils = async () => {
      try {
        const res = await EducationService.getConseilsByPatient(patientId);
        setConseils(res.data);
      } catch (error) {
        console.error("Erreur conseils :", error);
      }
    };

    fetchConseils();
  }, [patientId]);

  return (
    <Row className="m-0 vh-100">
      <SidebarPatient />
      <Col md={{ span: 9, offset: 3 }} className="p-4">

        <h3 className="mb-4">Éducation au diabète</h3>

        {/* --------------------------- Contenus Éducatifs --------------------------- */}
        <h4 className="mt-4">📘 Contenus éducatifs</h4>
        <Row xs={1} md={2} lg={2} className="g-4">
          {contenus.map((item, index) => (
            <Col key={index}>
              <Card className="h-100">
                <Card.Img variant="top" src={item.imageUrl} height="180" style={{ objectFit: 'cover' }} />
                <Card.Body>
                  <Card.Title>{item.titre}</Card.Title>
                  <Card.Text>{item.description}</Card.Text>
                  <Button variant="success" href={item.lien} target="_blank">
                    Voir
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* --------------------------- Campagnes --------------------------- */}
        <h4 className="mt-5">📢 Campagnes de sensibilisation</h4>
        <Row xs={1} md={2} lg={2} className="g-4">
          {campagnes.map((item, index) => (
            <Col key={index}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>{item.titre}</Card.Title>
                  <Card.Text>{item.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* --------------------------- Conseils personnalisés --------------------------- */}
        <h4 className="mt-5">💬 Conseils personnalisés</h4>
        
        {conseils.length === 0 ? (
          <p>Aucun conseil personnalisé pour le moment.</p>
        ) : (
          <ul className="list-group">
            {conseils.map((c) => (
              <li key={c.id} className="list-group-item">
                <strong>{c.titre}</strong>
                <p>{c.contenu || c.texte || "Contenu indisponible"}</p>
                <small>
                  Date : {new Date(c.dateCreation).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        )}

      </Col>
    </Row>
  );
}

export default Education;
