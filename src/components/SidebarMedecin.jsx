// src/components/SidebarMedecin.jsx
import React from "react";
import { Nav, Image } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaChartLine,
  FaEnvelope,
  FaBook,
  FaTachometerAlt,
  FaSignOutAlt,
  FaTeamspeak,
} from "react-icons/fa";
import defaultAvatar from "../images/default-avatar.jpg";
import "./SidebarMedecin.css";

function SidebarMedecin({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard-medecin", label: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/medecin/stats", label: "Statistiques", icon: <FaChartLine /> },
    { path: "/medecin/messagerie", label: "Messagerie", icon: <FaEnvelope /> },
    { path: "/medecin/education", label: "Éducation", icon: <FaBook /> },
    { path: "/medecin/equipes", label: "Équipes médicales", icon: <FaTeamspeak /> },
  ];

  return (
    <div className="sidebar-medecin open">
      
      {/* 🔹 LOGO (identique au SidebarPatient) */}
      <div
        className="app-header d-flex align-items-center justify-content-center mb-3"
        onClick={() => navigate("/dashboard-medecin")}
        style={{ cursor: "pointer" }}
      >
        <Image
          src={require("../images/logo-diabete.png")}
          alt="Logo santé"
          width="50"
          height="50"
          className="me-2"
        />
        <span
          className="fw-bold text-uppercase"
          style={{ fontSize: "16px", color: "#ffffff" }}
        >
          Suivi<span style={{ color: "#ffc107" }}>Diabète</span> SN
        </span>
      </div>

      {/* 🔹 PROFIL MÉDECIN */}
      <div
        className="sidebar-header d-flex align-items-center mb-4 mt-3"
        onClick={() => navigate("/dashboard-medecin")}
        style={{ cursor: "pointer" }}
      >
        <Image src={defaultAvatar} roundedCircle width={48} height={48} />
        <div className="ms-2">
          <div className="fw-bold text-white">
            {user?.prenom || "Prénom"} {user?.nom || ""}
          </div>
          <small className="text-light">
            {user?.specialite || "Médecin"}
          </small>
        </div>
      </div>

      {/* 🔹 NAVIGATION */}
      <Nav className="flex-column mt-3">
        {navItems.map((item, idx) => (
          <Nav.Link
            key={idx}
            onClick={() => navigate(item.path)}
            className={`sidebar-link ${
              location.pathname === item.path ? "active" : ""
            }`}
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </Nav.Link>
        ))}
      </Nav>

      {/* 🔹 LOGOUT */}
      <div className="mt-auto p-3">
        <button className="btn btn-outline-light w-100" onClick={logout}>
          <FaSignOutAlt className="me-2" /> Déconnexion
        </button>
      </div>
    </div>
  );
}

export default SidebarMedecin;
