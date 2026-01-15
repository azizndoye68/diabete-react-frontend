// src/components/HomePage.jsx
import React, { useEffect } from 'react';
import { Button, Navbar, Container, Nav, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaPhoneAlt, FaEnvelope, FaQuestionCircle } from 'react-icons/fa';
import suiviGlycemie from '../images/Suivi_Glycemie.png';
import logoDiabete from '../images/SuñuDiabète1.png';
import Footer from './Footer.jsx';

// Images type diabète
import diabeteType1 from '../images/diabete-type1.png';
import diabeteType2 from '../images/diabete-type2.png';
import diabeteGest from '../images/diabete-gest.png';

import AOS from 'aos';
import 'aos/dist/aos.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './HomePage.css';

function HomePage() {
    const navigate = useNavigate();

    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
    }, []);

    return (
        <div>
            {/* ============================ */}
            {/* Top bar */}
            <div className="top-bar d-flex justify-content-between align-items-center px-4 py-2 text-white">
                <div>
                    <span className="me-4">FR | BE</span>
                    <FaPhoneAlt className="me-2" /> +221 77 123 45 67
                    <span className="mx-3">|</span>
                    Du Lundi au Vendredi | 9h - 17h
                </div>
                <div>
                    <FaEnvelope className="me-2" /> contact@diabete-platforme.sn
                </div>
            </div>

            {/* Navbar */}
            <Navbar bg="success" variant="dark" expand="lg" className="px-4">
                <Container fluid>
                    <Navbar.Brand
                        href="/"
                        className="d-flex align-items-center fw-bold text-uppercase"
                        style={{ color: '#ffffff', letterSpacing: '1px' }}
                    >
                        <img
                            src={logoDiabete}
                            alt="Logo Diabète"
                            width="100"
                            height="100"
                            className="me-2"
                            style={{ borderRadius: '4px' }}
                        />
                        <span className="fs-4" style={{ color: '#ffc107', textTransform: 'none' }}>
                            SuñuDiabète
                        </span>
                    </Navbar.Brand>

                    <Nav className="ms-auto d-flex align-items-center">
                        <Nav.Link href="#" className="text-white me-3">
                            <FaQuestionCircle className="me-1" /> Aide
                        </Nav.Link>
                        <Button
                            variant="light"
                            className="rounded-3 me-2 nav-btn"
                            onClick={() => navigate('/register/choice')}
                        >
                            INSCRIPTION
                        </Button>
                        <Button
                            variant="outline-light"
                            className="rounded-3 nav-btn"
                            onClick={() => navigate('/login')}
                        >
                            CONNEXION
                        </Button>
                    </Nav>
                </Container>
            </Navbar>

            {/* Main hero section */}
            <div className="main-section d-flex flex-column flex-lg-row justify-content-between align-items-center p-5">
                <div style={{ maxWidth: '600px' }}>
                    <h1 className="display-5 fw-bold text-success mb-4">
                        L'application dédiée à améliorer le quotidien des patients diabétiques
                    </h1>
                    <p className="lead mb-4">
                        La solution numérique de télésuivi médical pensée pour le Sénégal, qui facilite la connexion entre le patient diabétique et son équipe de soins, pour un accompagnement plus simple, régulier et accessible, où que vous soyez.
                    </p>
                </div>
                <img
                    src={suiviGlycemie}
                    alt="suiviGlycemie"
                    className="img-fluid animated-image mt-5 mt-lg-0"
                    style={{ maxWidth: '500px' }}
                />
            </div>

            {/* ============================ */}
            {/* Section Types de diabète */}
            <section className="types-section py-5 bg-light">
                <Container>
                    <h2 className="text-center fw-bold mb-5 text-success" data-aos="fade-up">
                        Les types de diabète
                    </h2>
                    <Row className="g-4">
                        {/* Type 1 */}
                        <Col md={4} data-aos="fade-up" data-aos-delay="100">
                            <Card className="shadow-sm diabete-card text-center p-3 h-100">
                                <img src={diabeteType1} alt="Type 1" className="mb-3 type-img"/>
                                <Card.Body>
                                    <Card.Title>Diabète de type 1</Card.Title>
                                    <Card.Text>
                                        Maladie auto-immune, souvent détectée chez l'enfant ou le jeune adulte. Le corps ne produit pas d'insuline.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Type 2 */}
                        <Col md={4} data-aos="fade-up" data-aos-delay="200">
                            <Card className="shadow-sm diabete-card text-center p-3 h-100">
                                <img src={diabeteType2} alt="Type 2" className="mb-3 type-img"/>
                                <Card.Body>
                                    <Card.Title>Diabète de type 2</Card.Title>
                                    <Card.Text>
                                        Résistance à l'insuline ou production insuffisante, souvent lié au mode de vie et détecté chez l’adulte.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Diabète gestationnel */}
                        <Col md={4} data-aos="fade-up" data-aos-delay="300">
                            <Card className="shadow-sm diabete-card text-center p-3 h-100">
                                <img src={diabeteGest} alt="Gestationnel" className="mb-3 type-img"/>
                                <Card.Body>
                                    <Card.Title>Diabète gestationnel</Card.Title>
                                    <Card.Text>
                                        Survient pendant la grossesse. Une surveillance régulière est essentielle pour la mère et l'enfant.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>
            <Footer />

        </div>
    );
}

export default HomePage;
