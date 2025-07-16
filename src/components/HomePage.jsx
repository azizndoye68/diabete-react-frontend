// src/components/HomePage.jsx
import React from 'react';
import { Button, Navbar, Container, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaPhoneAlt, FaEnvelope, FaQuestionCircle } from 'react-icons/fa';
import suiviGlycemie from '../images/suiviGlycemie.jpg';
import logoDiabete from '../images/logo-diabete.png';

import 'bootstrap/dist/css/bootstrap.min.css';
import './HomePage.css';

function HomePage() {
    const navigate = useNavigate();

    return (
        <div>
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
                            width="60"
                            height="60"
                            className="me-2"
                            style={{ borderRadius: '4px' }}
                        />
                        <span className="fs-4">
                            Suivi<span style={{ color: '#ffc107' }}>Diabète</span> SN
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

            {/* Main section */}
            <div className="main-section d-flex flex-column flex-lg-row justify-content-between align-items-center p-5">
                <div style={{ maxWidth: '600px' }}>
                    <h1 className="display-5 fw-bold text-success mb-4">
                        L'application dédiée à améliorer le quotidien des patients diabétiques
                    </h1>
                    <p className="lead mb-4">
                        La solution numérique de télésuivi médical pensée pour le Sénégal, qui facilite la connexion entre le patient diabétique et son équipe de soins, pour un accompagnement plus simple, régulier et accessible, où que vous soyez.
                    </p>
                    <Button variant="success" size="lg" onClick={() => navigate('/register/choice')}>
                        JE M'INSCRIS
                    </Button>
                </div>
                <img
                   src={suiviGlycemie}
                    alt="suiviGlycemie"
                    className="img-fluid animated-image mt-5 mt-lg-0"
                    style={{ maxWidth: '500px' }}
                />
            </div>
        </div>
    );
}

export default HomePage;
