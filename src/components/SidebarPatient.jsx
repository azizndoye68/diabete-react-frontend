// src/components/SidebarPatient.jsx
import React from "react";
import { Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../images/default-avatar.jpg";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./SidebarPatient.css";

function SidebarPatient({ onShowAide, patient, isMedecin = false }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      className="sidebar-patient"
      style={{ 
        position: "fixed", 
        height: "100vh", 
        width: "280px",
        background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        boxShadow: "4px 0 20px rgba(102, 126, 234, 0.2)"
      }}
    >
      {/* Logo */}
      <div
        style={{ 
          padding: "20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          cursor: "pointer"
        }}
        onClick={() =>
          navigate(isMedecin ? "/dashboard-medecin" : "/dashboard-patient")
        }
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.2)",
            padding: "8px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)"
          }}>
            <Image
              src={require("../images/logo-diabete.png")}
              alt="Logo santé"
              width="45"
              height="45"
            />
          </div>
          <span style={{
            fontWeight: "bold",
            fontSize: "15px",
            marginLeft: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
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
          transition: "all 0.3s ease"
        }}
        onClick={() => navigate("/profile")}
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
              style={{
                border: "3px solid rgba(255, 255, 255, 0.3)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
              }}
            />
            <div style={{
              position: "absolute",
              bottom: "2px",
              right: "2px",
              width: "14px",
              height: "14px",
              background: "#ffc107",
              border: "3px solid #667eea",
              borderRadius: "50%",
              boxShadow: "0 0 12px rgba(255, 193, 7, 0.8)"
            }}></div>
          </div>
          {patient && (
            <div style={{ marginLeft: "12px", flexGrow: 1 }}>
              <div style={{ fontWeight: "bold", fontSize: "16px", color: "white" }}>
                {patient.prenom} {patient.nom}
              </div>
              <small style={{ color: "rgba(255, 255, 255, 0.75)", fontSize: "13px" }}>
                {isMedecin ? "Patient (vue médecin)" : "Patient"}
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Menu Navigation */}
      <nav style={{ flexGrow: 1, padding: "0 12px", overflowY: "auto" }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {/* Tableau de bord */}
          <li
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 16px",
              marginBottom: "6px",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontWeight: "500",
              fontSize: "15px"
            }}
            onClick={() => {
              if (isMedecin && patient?.id) {
                navigate(`/medecin/patient/${patient.id}/dashboard`);
              } else {
                navigate("/dashboard-patient");
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.transform = "translateX(5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <i className="bi bi-grid-fill" style={{ fontSize: "20px", marginRight: "14px", minWidth: "24px" }}></i>
            <span>Tableau de bord</span>
          </li>

          {/* Carnet */}
          <li
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 16px",
              marginBottom: "6px",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontWeight: "500",
              fontSize: "15px"
            }}
            onClick={() => {
              if (isMedecin && patient?.id) {
                navigate(`/medecin/patient/${patient.id}/carnet`);
              } else {
                navigate("/carnet");
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.transform = "translateX(5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <i className="bi bi-journal-medical" style={{ fontSize: "20px", marginRight: "14px", minWidth: "24px" }}></i>
            <span>Carnet</span>
          </li>

          {/* Statistiques */}
          <li
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 16px",
              marginBottom: "6px",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontWeight: "500",
              fontSize: "15px"
            }}
            onClick={() => {
              if (isMedecin && patient?.id) {
                navigate(`/medecin/patient/${patient.id}/statistiques`);
              } else {
                navigate("/statistiques");
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.transform = "translateX(5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <i className="bi bi-graph-up-arrow" style={{ fontSize: "20px", marginRight: "14px", minWidth: "24px" }}></i>
            <span>Mes statistiques</span>
          </li>

          {/* Mon suivi */}
          <li
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 16px",
              marginBottom: "6px",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontWeight: "500",
              fontSize: "15px"
            }}
            onClick={() => {
              if (isMedecin && patient?.id) {
                navigate(`/medecin/patient/${patient.id}/mon-suivi`);
              } else {
                navigate("/mon-suivi");
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.transform = "translateX(5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <i className="bi bi-heart-pulse-fill" style={{ fontSize: "20px", marginRight: "14px", minWidth: "24px" }}></i>
            <span>Mon suivi</span>
          </li>

          {/* Équipe soignante */}
          {!isMedecin && (
            <li
              style={{
                display: "flex",
                alignItems: "center",
                padding: "14px 16px",
                marginBottom: "6px",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontWeight: "500",
                fontSize: "15px"
              }}
              onClick={() => navigate("/patient/messagerie")}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.transform = "translateX(5px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <i className="bi bi-chat-dots-fill" style={{ fontSize: "20px", marginRight: "14px", minWidth: "24px" }}></i>
              <span>Équipe soignante</span>
            </li>
          )}

          {/* Éducation */}
          {!isMedecin && (
            <li
              style={{
                display: "flex",
                alignItems: "center",
                padding: "14px 16px",
                marginBottom: "6px",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontWeight: "500",
                fontSize: "15px"
              }}
              onClick={() => {
                if (isMedecin && patient?.id) {
                  navigate(`/medecin/patient/${patient.id}/education`);
                } else {
                  navigate("/patient/education");
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.transform = "translateX(5px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <i className="bi bi-book-fill" style={{ fontSize: "20px", marginRight: "14px", minWidth: "24px" }}></i>
              <span>Éducation</span>
            </li>
          )}

          {/* Objets connectés */}
          {!isMedecin && (
            <li
              style={{
                display: "flex",
                alignItems: "center",
                padding: "14px 16px",
                marginBottom: "6px",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontWeight: "500",
                fontSize: "15px"
              }}
              onClick={() => navigate("/objets")}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.transform = "translateX(5px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <i className="bi bi-smartwatch" style={{ fontSize: "20px", marginRight: "14px", minWidth: "24px" }}></i>
              <span>Objets connectés</span>
            </li>
          )}

          {/* Section médecin */}
          {isMedecin && patient && (
            <>
              <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.15)", margin: "16px 0" }}></div>

              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 16px",
                  marginBottom: "6px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontWeight: "500",
                  fontSize: "15px"
                }}
                onClick={() =>
                  navigate(`/medecin/patient/${patient.id}/traitements`)
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                  e.currentTarget.style.transform = "translateX(5px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <i className="bi bi-clipboard2-pulse-fill" style={{ fontSize: "20px", marginRight: "14px", minWidth: "24px" }}></i>
                <span>Informations</span>
              </li>

              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 16px",
                  marginBottom: "6px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontWeight: "500",
                  fontSize: "15px"
                }}
                onClick={() =>
                  navigate(`/medecin/patient/${patient.id}/consultations`)
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                  e.currentTarget.style.transform = "translateX(5px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <i className="bi bi-calendar-check-fill" style={{ fontSize: "20px", marginRight: "14px", minWidth: "24px" }}></i>
                <span>Consultations</span>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* Footer - Version compacte */}
      {!isMedecin && (
        <div style={{
          padding: "8px 12px",
          borderTop: "1px solid rgba(255, 255, 255, 0.15)",
          background: "rgba(0, 0, 0, 0.15)"
        }}>
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
              fontSize: "14px"
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
              fontSize: "14px"
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
      )}
    </div>
  );
}

export default SidebarPatient;