// src/pages/CodeCouleur.jsx
import React, { useEffect, useState } from "react";
import SidebarPatient from "../../components/SidebarPatient";
import api from "../../services/api";
import ColorRange from "./ColorRange"; // assure-toi que ce chemin est correct
import "./CodeCouleur.css";

export default function CodeCouleur() {
  const [patient, setPatient] = useState(null);

  // Charger le patient connecté
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const profileRes = await api.get("/api/auth/profile");
        const utilisateurId = profileRes.data.id;
        const patientRes = await api.get(`/api/patients/byUtilisateur/${utilisateurId}`);
        setPatient(patientRes.data);
      } catch (err) {
        console.error("Erreur récupération patient :", err);
      }
    };
    fetchPatient();
  }, []);

  // Définition des seuils comme sur MyDiabby
  const seuilsGlycemie = {
    hypo: "≤0,69 g/L",
    normal: "0,70 - 1,80 g/L",
    eleve: "1,81 - 2,50 g/L",
    hyper: ">2,50 g/L",
  };


  return (
    <div className="code-couleur-page d-flex">
      {/* Sidebar avec le patient */}
      <SidebarPatient patient={patient} />

      {/* Contenu principal */}
      <div className="main-content p-4" style={{ flex: 1 }}>
        <h2 className="mb-4 fw-bold" style={{ fontSize: "1.5rem", color: "#333" }}>
          Mon suivi <span style={{ color: "#555" }}>– Mes codes couleurs</span>
        </h2>

        {patient ? (
          <div>
            <ColorRange
              title="Glycémies à jeun (avant petit-déjeuner)"
              thresholds={seuilsGlycemie}
            />
            <ColorRange
              title="Glycémies avant repas"
              thresholds={seuilsGlycemie}
            />
            <ColorRange
              title="Glycémies après repas"
              thresholds={seuilsGlycemie}
            />
          </div>
        ) : (
          <p>Chargement des informations patient...</p>
        )}
      </div>
    </div>
  );
}
