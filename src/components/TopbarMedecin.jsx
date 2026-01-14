import React from "react";
import { Navbar, Nav, Image, Dropdown } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaChartLine,
  FaEnvelope,
  FaUser,
  FaUsers,
  FaCalendarAlt ,
  FaSignOutAlt,
} from "react-icons/fa";
import defaultAvatar from "../images/default-avatar.jpg";
import "./TopbarMedecin.css";

function TopbarMedecin({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard-medecin", label: "Mes patients", icon: <FaUsers  /> },
    { path: "/medecin/messagerie", label: "Messagerie", icon: <FaEnvelope /> },
    { path: "/medecin/stats", label: "Statistiques", icon: <FaChartLine /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Navbar className="topbar-medecin px-3" expand="lg">
      {/* 🔹 Logo */}
      <Navbar.Brand
        className="d-flex align-items-center"
        onClick={() => navigate("/dashboard-medecin")}
        style={{ cursor: "pointer" }}
      >
        <Image
          src={require("../images/logo-diabete.png")}
          width={40}
          height={40}
          className="me-2"
        />
        <span className="fw-bold text-uppercase logo-text">
          Suivi<span className="highlight">Diabète</span> SN
        </span>
      </Navbar.Brand>

      {/* ✅ Bouton hamburger (mobile) */}
      <Navbar.Toggle aria-controls="topbar-medecin-nav" />

      {/* ✅ Contenu responsive */}
      <Navbar.Collapse id="topbar-medecin-nav">
        {/* 🔹 Navigation */}
        <Nav className="mx-auto topbar-nav">
          {navItems.map((item, idx) => (
            <Nav.Link
              key={idx}
              onClick={() => navigate(item.path)}
              className={`topbar-link ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
            </Nav.Link>
          ))}
        </Nav>

        {/* 🔹 Profil avec dropdown */}
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="link"
            id="dropdown-profil"
            className="d-flex align-items-center text-white p-0"
          >
            <span className="me-2">{user?.prenom || "Médecin"}</span>
            <Image
              src={defaultAvatar}
              roundedCircle
              width={40}
              height={40}
              style={{ cursor: "pointer" }}
            />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => navigate("/profile")}>
              <FaUser className="me-2" /> Mon compte
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate("/medecin/equipes")}>
              <FaUsers className="me-2" /> Mes équipes
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate("/medecin/rendezvous")}>
              <FaCalendarAlt  className="me-2" /> Rendez-vous
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout}>
              <FaSignOutAlt className="me-2" /> Déconnexion
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default TopbarMedecin;
