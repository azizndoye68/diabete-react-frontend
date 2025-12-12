// src/components/ColorRange.jsx
import React from "react";
import "./ColorRange.css";

export default function ColorRange({ title, thresholds }) {
  if (!thresholds) return null;

  const { hypo, normal, eleve, hyper } = thresholds;

  return (
    <div className="color-range mb-4">
      {/* Titre */}
      <h5 className="fw-bold mb-2" style={{ fontSize: "1rem", color: "#222" }}>
        {title}
      </h5>

      {/* Légendes */}
      <div className="d-flex justify-content-between mb-1 small text-secondary">
        <span>Hypo ({hypo})</span>
        <span>Normal ({normal})</span>
        <span>Élevé ({eleve})</span>
        <span>Hyper ({hyper})</span>
      </div>

      {/* Barre colorée */}
      <div className="d-flex rounded overflow-hidden" style={{ height: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
        <div style={{ flex: 1, backgroundColor: "#36a2f4ff" }}></div>   {/* Hypo - rouge */}
        <div style={{ flex: 1, backgroundColor: "#4caf50" }}></div>   {/* Normal - vert */}
        <div style={{ flex: 1, backgroundColor: "#ff9800" }}></div>   {/* Élevé - orange */}
        <div style={{ flex: 1, backgroundColor: "red" }}></div>   {/* Hyper - violet */}
      </div>
    </div>
  );
}
