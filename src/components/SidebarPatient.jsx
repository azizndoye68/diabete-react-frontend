// src/components/SidebarPatient.jsx
import React from 'react';
import { Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from '../images/default-avatar.jpg';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './SidebarPatient.css';

function SidebarPatient({ onShowAide, patient, isMedecin = false }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div
      className="sidebar bg-success text-white d-flex flex-column p-4"
      style={{ position: 'fixed', height: '100vh', width: '250px' }}
    >
      {/* Logo */}
      <div
        className="app-header d-flex align-items-center justify-content-center mb-3"
        onClick={() =>
        navigate(isMedecin ? '/dashboard-medecin' : '/dashboard-patient')
        }
        style={{ cursor: 'pointer' }}
      >
        <Image
          src={require('../images/SuñuDiabète1.png')}
          alt="Logo santé"
          width="50"
          height="50"
          className="me-2"
        />
        <span
          className="fw-bold text-uppercase"
          style={{ fontSize: '16px', color: '#ffc107' }}
        >
          SuñuDiabète
        </span>
      </div>

      {/* Profil */}
      <div
        className="sidebar-header d-flex align-items-center mb-4 mt-4"
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/profile')}
      >
        <Image src={defaultAvatar} roundedCircle width="50" height="50" />
        {patient && (
          <div className="ms-3">
            <div className="fw-bold">
              {patient.prenom} {patient.nom}
            </div>
            <small className="text-light">
              {isMedecin ? 'Patient (vue médecin)' : 'Patient'}
            </small>
          </div>
        )}
      </div>

      {/* 🔙 RETOUR DASHBOARD MÉDECIN 
{isMedecin && (
  <li
    className="nav-link text-white mb-3 fw-bold"
    onClick={() => navigate('/dashboard-medecin')}
    style={{ cursor: 'pointer' }}
  >
    <i className="bi bi-arrow-left-circle-fill me-2"></i>
    Retour médecin
  </li>
)}*/}


      {/* Menu */}
      <ul className="list-unstyled">

        <li
          className="nav-link text-white mb-1"
          onClick={() => {
            if (isMedecin && patient?.id) {
              navigate(`/medecin/patient/${patient.id}/dashboard`);
            } else {
              navigate('/dashboard-patient');
            }
          }}
        >
          <i className="bi bi-speedometer2 me-2"></i> Tableau de bord
        </li>

        <li
          className="nav-link text-white mb-1"
          onClick={() => {
            if (isMedecin && patient?.id) {
              navigate(`/medecin/patient/${patient.id}/carnet`);
            } else {
              navigate('/carnet');
            }
          }}
        >
          <i className="bi bi-journal-bookmark-fill me-2"></i> Carnet
        </li>

        <li
          className="nav-link text-white mb-1"
          onClick={() => {
            if (isMedecin && patient?.id) {
              navigate(`/medecin/patient/${patient.id}/statistiques`);
            } else {
              navigate('/statistiques');
            }
          }}
        >
          <i className="bi bi-bar-chart-line-fill me-2"></i> Mes stats
        </li>

        <li
          className="nav-link text-white mb-1"
          onClick={() => {
            if (isMedecin && patient?.id) {
              navigate(`/medecin/patient/${patient.id}/mon-suivi`);
            } else {
              navigate('/mon-suivi');
            }
          }}
        >
          <i className="bi bi-heart-pulse-fill me-2"></i> Mon suivi
        </li>

        {/* ❌ Équipe soignante → PAS pour médecin */}
        {!isMedecin && (
          <li
            className="nav-link text-white mb-1"
            onClick={() => navigate('/equipe-soignante')}
          >
            <i className="bi bi-people-fill me-2"></i> Équipe soignante
          </li>
        )}

        {!isMedecin && (
        <li
          className="nav-link text-white mb-1"
          onClick={() => {
            if (isMedecin && patient?.id) {
              navigate(`/medecin/patient/${patient.id}/education`);
            } else {
              navigate('/patient/education');
            }
          }}
        >
          <i className="bi bi-book-half me-2"></i> Éducation
        </li>
        )}

        {/* ❌ Objets connectés → PAS pour médecin */}
        {!isMedecin && (
          <li
            className="nav-link text-white mb-1"
            onClick={() => navigate('/objets')}
          >
            <i className="bi bi-smartwatch me-2"></i> Objets connectés
          </li>
        )}

        {/* 🔥 SPÉCIFIQUE MÉDECIN */}
        {isMedecin && patient && (
          <>
            <hr className="text-light" />

            <li
              className="nav-link text-white mb-1"
              onClick={() => navigate(`/medecin/patient/${patient.id}/traitements`)}
            >
              <i className="bi bi-capsule me-2"></i> Informations
            </li>

            <li
              className="nav-link text-white mb-1"
              onClick={() => navigate(`/medecin/patient/${patient.id}/consultations`)}
            >
              <i className="bi bi-clipboard-pulse me-2"></i> Consultations
            </li>
          </>
        )}

        {/* ❌ Aide → PAS pour médecin */}
        {!isMedecin && (
          <li className="nav-link text-white mt-2" onClick={onShowAide}>
            <i className="bi bi-question-circle-fill me-2"></i> Aide
          </li>
        )}

        {/* ❌ Se déconnecter → PAS pour médecin */}
        {!isMedecin && (
          <li className="nav-link text-white" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i> Se déconnecter
          </li>
        )}
      </ul>
    </div>
  );
}

export default SidebarPatient;
