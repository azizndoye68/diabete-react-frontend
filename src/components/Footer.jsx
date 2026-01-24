import React from "react";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import logo from "../images/logo-diabete.png"; // 🔹 ajoute le logo de ta plateforme
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-container">
          {/* 🔹 Logo et description */}
          <div className="footer-brand">
            <img src={logo} alt="SUIVIDIABETE SN" className="footer-logo" />
            <p>
              SUIVIDIABETE SN - Plateforme de suivi des patients diabétiques. Notifications, suivi complet et statistiques.
            </p>
          </div>

          {/* 🔹 Liens rapides */}
          <div className="footer-links">
            <h5>Liens rapides</h5>
            <ul>
              <li><button className="footer-link">Accueil</button></li>
              <li><button className="footer-link">Patients</button></li>
              <li><button className="footer-link">Rendez-vous</button></li>
              <li><button className="footer-link">Éducation</button></li>
            </ul>
          </div>

          {/* 🔹 Réseaux sociaux */}
          <div className="footer-social">
            <h5>Suivez-nous</h5>
            <div className="social-icons">
              <button className="social-btn"><Facebook size={24} /></button>
              <button className="social-btn"><Twitter size={24} /></button>
              <button className="social-btn"><Linkedin size={24} /></button>
              <button className="social-btn"><Instagram size={24} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Footer bas */}
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} SUIVIDIABETE SN. Tous droits réservés.
      </div>
    </footer>
  );
}

export default Footer;
