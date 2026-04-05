// src/components/TopbarAdmin.jsx
import React from "react";
import { Navbar, Nav, Image, Dropdown } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaChartBar,
  FaUsers,
  FaUserMd,
  FaHourglassHalf,
  FaSignOutAlt,
  FaBell,
  FaUser,
  FaGraduationCap,
  FaQuestionCircle,
  FaTachometerAlt,
} from "react-icons/fa";
import defaultAvatar from "../images/default-avatar.jpg";
import "./TopbarAdmin.css";

function TopbarAdmin({ admin, onShowAide }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard-admin", label: "Tableau de bord", icon: <FaTachometerAlt /> },
    { path: "/admin/patients", label: "Patients", icon: <FaUsers /> },
    { path: "/admin/medecins", label: "Médecins", icon: <FaUserMd /> },
    { path: "/admin/attente", label: "En attente", icon: <FaHourglassHalf />, badge: null },
    { path: "/admin/statistiques", label: "Statistiques", icon: <FaChartBar /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Navbar className="topbar-admin" expand="lg">
      <div className="topbar-admin-container">
        {/* Logo */}
        <Navbar.Brand
          className="topbar-admin-brand"
          onClick={() => navigate("/dashboard-admin")}
        >
          <div className="admin-logo-wrapper">
            <Image
              src={require("../images/logo-diabete.png")}
              width={40}
              height={40}
            />
          </div>
          <span className="admin-brand-name">
            Suivi<span className="admin-brand-highlight">Diabète</span> SN
          </span>
        </Navbar.Brand>

        {/* Hamburger */}
        <Navbar.Toggle aria-controls="topbar-admin-nav" className="topbar-admin-toggle" />

        {/* Contenu responsive */}
        <Navbar.Collapse id="topbar-admin-nav">
          {/* Navigation */}
          <Nav className="topbar-admin-nav mx-auto">
            {navItems.map((item, idx) => (
              <Nav.Link
                key={idx}
                onClick={() => navigate(item.path)}
                className={`topbar-admin-nav-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-label">{item.label}</span>
                {item.badge && (
                  <span className="admin-nav-badge">{item.badge}</span>
                )}
              </Nav.Link>
            ))}
          </Nav>

          {/* Actions droite */}
          <div className="topbar-admin-actions">
            {/* Aide */}
            <button
              className="admin-action-btn"
              onClick={onShowAide}
              title="Aide"
            >
              <FaQuestionCircle />
            </button>

            {/* Notifications */}
            <div className="admin-notification-wrapper">
              <button
                className="admin-notification-btn"
                onClick={() => navigate("/notifications")}
                title="Notifications"
              >
                <FaBell />
                <span className="admin-notification-dot"></span>
              </button>
            </div>

            {/* Profil */}
            <Dropdown align="end" className="admin-profile-dropdown">
              <Dropdown.Toggle as="div" className="admin-profile-toggle">
                <div className="admin-profile-info">
                  <div className="admin-profile-text">
                    <span className="admin-profile-name">
                      {admin?.username || "Administrateur"}
                    </span>
                    <span className="admin-profile-role">Administrateur</span>
                  </div>
                  <div className="admin-profile-avatar-wrapper">
                    <Image
                      src={defaultAvatar}
                      roundedCircle
                      width={45}
                      height={45}
                      className="admin-profile-avatar"
                    />
                    <span className="admin-status-indicator"></span>
                  </div>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="admin-profile-menu">
                <div className="admin-profile-menu-header">
                  <Image
                    src={defaultAvatar}
                    roundedCircle
                    width={50}
                    height={50}
                  />
                  <div className="ms-3">
                    <div className="fw-bold">{admin?.username}</div>
                    <small className="text-muted">{admin?.email}</small>
                  </div>
                </div>

                <Dropdown.Divider />

                <Dropdown.Item
                  onClick={() => navigate("/admin/profile")}
                  className="admin-profile-menu-item"
                >
                  <FaUser className="admin-menu-icon" />
                  <span>Mon compte</span>
                </Dropdown.Item>

                <Dropdown.Item
                  onClick={() => navigate("/medecin/education")}
                  className="admin-profile-menu-item"
                >
                  <FaGraduationCap className="admin-menu-icon" />
                  <span>Éducation</span>
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item
                  onClick={handleLogout}
                  className="admin-profile-menu-item admin-logout-item"
                >
                  <FaSignOutAlt className="admin-menu-icon" />
                  <span>Déconnexion</span>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
}

export default TopbarAdmin;