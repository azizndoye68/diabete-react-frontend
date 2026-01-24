// src/components/SidebarAdmin.jsx
import React from "react";
import { Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../images/default-avatar.jpg";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./SidebarPatient.css"; // réutilisation du même style

function SidebarAdmin({ admin, onShowAide }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      className="sidebar bg-success text-white d-flex flex-column p-4"
      style={{ position: "fixed", height: "100vh", width: "250px" }}
    >
      {/* ===== Logo ===== */}
      <div
        className="app-header d-flex align-items-center justify-content-center mb-3"
        onClick={() => navigate("/dashboard-admin")}
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

      {/* ===== Profil ===== */}
      <div
        className="sidebar-header d-flex align-items-center mb-4 mt-4"
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/admin/profile")}
      >
        <Image src={defaultAvatar} roundedCircle width="50" height="50" />
        {admin && (
          <div className="ms-3">
            <div className="fw-bold">{admin.username}</div>
            <small className="text-light">Administrateur</small>
          </div>
        )}
      </div>

      {/* ===== Menu ===== */}
      <ul className="list-unstyled">
        <li
          className="nav-link text-white mb-2"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/dashboard-admin")}
        >
          <i className="bi bi-speedometer2 me-2"></i> Tableau de bord
        </li>

        <li
          className="nav-link text-white mb-2"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/admin/patients")}
        >
          <i className="bi bi-people-fill me-2"></i> Patients
        </li>

        <li
          className="nav-link text-white mb-2"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/admin/medecins")}
        >
          <i className="bi bi-person-badge-fill me-2"></i> Médecins
        </li>

        <li
          className="nav-link text-white mb-2"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/admin/attente")}
        >
          <i className="bi bi-hourglass-split me-2"></i> Médecins en attente
        </li>

        <li
          className="nav-link text-white mb-2"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/admin/statistiques")}
        >
          <i className="bi bi-bar-chart-line-fill me-2"></i> Statistiques
        </li>

        <li
          className="nav-link text-white mb-2"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/medecin/education")}
        >
          <i className="bi bi-mortarboard-fill me-2"></i> Éducation
        </li>

        <li
          className="nav-link text-white mb-2"
          style={{ cursor: "pointer" }}
          onClick={onShowAide}
        >
          <i className="bi bi-question-circle-fill me-2"></i> Aide
        </li>

        <li
          className="nav-link text-white mt-3"
          style={{ cursor: "pointer" }}
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right me-2"></i> Se déconnecter
        </li>
      </ul>
    </div>
  );
}

export default SidebarAdmin;
