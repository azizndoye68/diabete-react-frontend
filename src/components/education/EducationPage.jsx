import React, { useState } from "react";
import ContentManager from "./ContentManager";
import CampaignManager from "./CampaignManager";
import ConseilManager from "./ConseilManager";
import "./EducationPage.css";

function EducationPage() {
  const [activeTab, setActiveTab] = useState("contenus");

  return (
    <div className="education-container">

      <h2 className="text-success fw-bold mb-4">
        📚 Espace Éducation — Médecin
      </h2>

      {/* Onglets */}
      <div className="education-tabs">
        <button
          className={activeTab === "contenus" ? "active" : ""}
          onClick={() => setActiveTab("contenus")}
        >
          Contenus éducatifs
        </button>

        <button
          className={activeTab === "campagnes" ? "active" : ""}
          onClick={() => setActiveTab("campagnes")}
        >
          Campagnes d’éducation
        </button>

        <button
          className={activeTab === "conseils" ? "active" : ""}
          onClick={() => setActiveTab("conseils")}
        >
          Conseils personnalisés
        </button>
      </div>

      {/* Contenu */}
      <div className="education-content">
        {activeTab === "contenus" && <ContentManager />}
        {activeTab === "campagnes" && <CampaignManager />}
        {activeTab === "conseils" && <ConseilManager />}
      </div>
    </div>
  );
}

export default EducationPage;
