// src/components/SidebarAdmin.jsx
import React from "react";
import { Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../images/default-avatar.jpg";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./SidebarAdmin.css";

function SidebarAdmin({ admin, onShowAide }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      className="sidebar-admin"
      style={{
        position: "fixed",
        height: "100vh",
        width: "280px",
        color: "white",
        display: "flex",
        flexDirection: "column",
        boxShadow: "4px 0 20px rgba(17, 153, 142, 0.2)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          cursor: "pointer",
        }}
        onClick={() => navigate("/dashboard-admin")}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              padding: "8px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Image src={require("../images/logo-diabete.png")} alt="Logo santé" width="45" height="45" />
          </div>
          <span style={{ fontWeight: "bold", fontSize: "15px", marginLeft: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Suivi<span style={{ color: "#ffc107" }}>Diabète</span> SN
          </span>
        </div>
      </div>

      {/* Profil */}
      <div
        style={{
          margin: "20px",
          padding: "16px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        onClick={() => navigate("/admin/profile")}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Image
              src={defaultAvatar}
              roundedCircle
              width="55"
              height="55"
              style={{ border: "3px solid rgba(255, 255, 255, 0.3)", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)" }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "2px",
                right: "2px",
                width: "14px",
                height: "14px",
                background: "#ffc107",
                border: "3px solid #11998e",
                borderRadius: "50%",
                boxShadow: "0 0 12px rgba(255, 193, 7, 0.8)",
              }}
            ></div>
          </div>
          {admin && (
            <div style={{ marginLeft: "12px", flexGrow: 1 }}>
              <div style={{ fontWeight: "bold", fontSize: "16px", color: "white" }}>
                {admin.username}
              </div>
              <small style={{ color: "rgba(255, 255, 255, 0.75)", fontSize: "13px" }}>
                Administrateur
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Menu Navigation */}
      <nav style={{ flexGrow: 1, padding: "0 12px", overflowY: "auto" }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>

          {[
            { icon: "bi-speedometer2", label: "Tableau de bord", path: "/dashboard-admin" },
            { icon: "bi-people-fill", label: "Patients", path: "/admin/patients" },
            { icon: "bi-person-badge-fill", label: "Médecins", path: "/admin/medecins" },
            { icon: "bi-hourglass-split", label: "Médecins en attente", path: "/admin/attente" },
            { icon: "bi-bar-chart-line-fill", label: "Statistiques", path: "/admin/statistiques" },
            { icon: "bi-mortarboard-fill", label: "Éducation", path: "/medecin/education" },
          ].map((item) => (
            <li
              key={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "14px 16px",
                marginBottom: "6px",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontWeight: "500",
                fontSize: "15px",
              }}
              onClick={() => navigate(item.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.transform = "translateX(5px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <i className={`bi ${item.icon}`} style={{ fontSize: "20px", marginRight: "14px", minWidth: "24px" }}></i>
              <span>{item.label}</span>
            </li>
          ))}

        </ul>
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "8px 12px",
          borderTop: "1px solid rgba(255, 255, 255, 0.15)",
          background: "rgba(0, 0, 0, 0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 16px",
            marginBottom: "4px",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            fontWeight: "500",
            fontSize: "14px",
          }}
          onClick={onShowAide}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
            e.currentTarget.style.transform = "translateX(5px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.transform = "translateX(0)";
          }}
        >
          <i className="bi bi-question-circle-fill" style={{ fontSize: "18px", marginRight: "12px", minWidth: "20px" }}></i>
          <span>Aide</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 16px",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            fontWeight: "500",
            fontSize: "14px",
          }}
          onClick={handleLogout}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 193, 7, 0.2)";
            e.currentTarget.style.color = "#ffc107";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "white";
          }}
        >
          <i className="bi bi-box-arrow-right" style={{ fontSize: "18px", marginRight: "12px", minWidth: "20px" }}></i>
          <span>Déconnexion</span>
        </div>
      </div>
    </div>
  );
}

export default SidebarAdmin;