// src/components/HomePage.jsx
import React from 'react';
import { Button, Navbar, Container, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function HomePage() {
    const navigate = useNavigate();

    return (
        <div>
            {/* Navbar */}
            <Navbar bg="primary" variant="dark" expand="lg" className="py-3">
                <Container>
                    <Navbar.Brand href="/">Plateforme Diabète</Navbar.Brand>
                    <Nav className="ml-auto">
                        <Nav.Link onClick={() => navigate('/register')}>INSCRIPTION</Nav.Link>
                        <Nav.Link onClick={() => navigate('/login')}>CONNEXION</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>

            {/* Body */}
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center p-5" style={{ background: 'linear-gradient(to right, #f8f9fa, #e9ecef)', minHeight: '90vh' }}>
                <div style={{ maxWidth: '600px' }}>
                    <h1 className="display-4 fw-bold text-primary mb-4">La plateforme de Télésurveillance du diabète</h1>
                    <p className="lead mb-4">
                        La solution numérique qui améliore l’organisation des professionnels de santé et le suivi des patients diabétiques de type 1, type 2 ou gestationnel.
                    </p>
                    <Button variant="primary" size="lg" onClick={() => navigate('/register')}>JE M'INSCRIS</Button>
                </div>

                {/* Image */}
                <img src="https://via.placeholder.com/500" alt="Illustration" className="img-fluid mt-5 mt-lg-0" />
            </div>
        </div>
    );
}

export default HomePage;
