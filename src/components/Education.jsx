import React from 'react';
import {Row, Col, Card, Button } from 'react-bootstrap';
import SidebarPatient from '../components/SidebarPatient';

function Education() {
  const ressources = [
    {
      titre: "Comprendre le diabète",
      image: "/assets/education/type-diabete.jpeg",
      lien: "https://www.federationdesdiabetiques.org/information/diabete",
      description: "Un guide complet sur les types de diabète et les traitements.",
    },
    {
      titre: "Alimentation et diabète",
      image: "/assets/education/aliment.jpeg",
      lien: "https://www.diabete.qc.ca/fr/comprendre-le-diabete/alimentation/",
      description: "Conseils nutritionnels pour mieux gérer votre glycémie.",
    },
    {
      titre: "Activité physique",
      image: "/assets/education/sport.jpeg",
      lien: "/pdfs/diabete-et-sport.pdf",
      description: "L'importance de l'exercice pour le patient diabétique.",
    },
    {
      titre: "Gestion de l'insuline",
      image: "/assets/education/insuline.jpg",
      lien: "https://www.diabete.fr/guides/insuline-mode-demploi",
      description: "Comment bien utiliser son insuline au quotidien.",
    },
  ];

  return (
    <Row className="m-0 vh-100">
      <SidebarPatient />
      <Col md={{ span: 9, offset: 3 }} className="p-4">
        <h3 className="mb-4">Éducation au diabète</h3>
        <Row xs={1} md={2} lg={2} className="g-4">
          {ressources.map((res, index) => (
            <Col key={index}>
              <Card className="h-100">
                <Card.Img variant="top" src={res.image} height="180px" style={{ objectFit: 'cover' }} />
                <Card.Body>
                  <Card.Title>{res.titre}</Card.Title>
                  <Card.Text>{res.description}</Card.Text>
                  <Button variant="success" href={res.lien} target="_blank">
                    Voir la ressource
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Col>
    </Row>
  );
}

export default Education;
