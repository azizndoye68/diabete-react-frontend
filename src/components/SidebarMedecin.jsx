// src/components/SidebarMedecin.jsx
import React, { useState } from "react";
import { Nav, Image } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaUsers,
  FaChartLine,
  FaEnvelope,
  FaBook,
  FaTachometerAlt,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import defaultAvatar from "../images/default-avatar.jpg";
import "./SidebarMedecin.css";

function SidebarMedecin({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard-medecin", label: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/medecin/patients-table", label: "Patients", icon: <FaUsers /> },
    { path: "/medecin/stats", label: "Statistiques", icon: <FaChartLine /> },
    { path: "/medecin/messagerie", label: "Messagerie", icon: <FaEnvelope /> },
    { path: "/medecin/education", label: "Éducation", icon: <FaBook /> },
  ];

  return (
    <div className={`sidebar-medecin ${isOpen ? "open" : "collapsed"}`}>
      {/* Bouton toggle */}
      <div className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        <FaBars />
      </div>

      {/* Profil */}
      <div
        className="sidebar-header d-flex align-items-center"
        onClick={() => navigate("/dashboard-medecin")}
      >
        <Image src={defaultAvatar} roundedCircle width={48} height={48} />
        {isOpen && (
          <div className="ms-2">
            <div className="fw-bold text-white">
              {user?.prenom || "Prénom"} {user?.nom || ""}
            </div>
            <small className="text-light">
              {user?.specialite || "Médecin"}
            </small>
          </div>
        )}
      </div>

      {/* Navigation */}
      <Nav className="flex-column mt-4">
        {navItems.map((item, idx) => (
          <Nav.Link
            key={idx}
            onClick={() => navigate(item.path)}
            className={`sidebar-link ${
              location.pathname === item.path ? "active" : ""
            }`}
          >
            <span className="icon">{item.icon}</span>
            {isOpen && <span>{item.label}</span>}
          </Nav.Link>
        ))}
      </Nav>

      {/* Logout */}
      <div className="mt-auto p-3">
        <button className="btn btn-outline-light w-100" onClick={logout}>
          <FaSignOutAlt className="me-2" /> {isOpen && "Déconnexion"}
        </button>
      </div>
    </div>
  );
}

export default SidebarMedecin;
