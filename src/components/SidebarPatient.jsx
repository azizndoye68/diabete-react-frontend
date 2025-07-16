// src/components/SidebarPatient.jsx
import React, { useEffect, useState } from 'react';
import { Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import defaultAvatar from '../images/default-avatar.jpg';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './SidebarPatient.css'; // Tu peux créer ce fichier pour tes styles spécifiques

function SidebarPatient() {
  const [user, setUser] = useState({ nom: '', prenom: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/api/auth/profile');
        setUser(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération du profil', error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="sidebar bg-success text-white d-flex flex-column p-4" style={{ position: 'fixed', height: '100vh', width: '250px' }}>
        <div className="app-header d-flex align-items-center justify-content-center mb-3"
             onClick={() => navigate('/dashboard')}
             style={{ cursor: 'pointer' }}>
            <Image
                src={require('../images/logo-diabete.png')}
                alt="Logo santé"
                width="50"
                height="50"
                className="me-2"
              />
              <span className="fw-bold text-uppercase" style={{ fontSize: '16px', color: '#ffffff' }}>
                Suivi<span style={{ color: '#ffc107' }}>Diabète</span> SN
            </span>
        </div>


      {/* Profil */}
      <div className="d-flex align-items-center mb-4 mt-4" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
        <Image src={defaultAvatar} roundedCircle width="50" height="50" />
        <span className="ms-3 fw-bold">{user.prenom} {user.nom}</span>
      </div>

      {/* Menu */}
      <ul className="list-unstyled">
        <li className="nav-link text-white mb-1" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <i className="bi bi-speedometer2 me-2"></i> Tableau de bord
        </li>
        <li className="nav-link text-white mb-1" onClick={() => navigate('/carnet')} style={{ cursor: 'pointer' }}>
          <i className="bi bi-journal-bookmark-fill me-2"></i> Carnet
        </li>
        <li className="nav-link text-white mb-1" onClick={() => navigate('/stats')} style={{ cursor: 'pointer' }}>
          <i className="bi bi-bar-chart-line-fill me-2"></i> Mes stats
        </li>
        <li className="nav-link text-white mb-1" onClick={() => navigate('/suivi')} style={{ cursor: 'pointer' }}>
          <i className="bi bi-heart-pulse-fill me-2"></i> Mon suivi
        </li>
        <li className="nav-link text-white mb-1" onClick={() => navigate('/equipe')} style={{ cursor: 'pointer' }}>
          <i className="bi bi-people-fill me-2"></i> Équipe soignante
        </li>
        <li className="nav-link text-white mb-1" onClick={() => navigate('/education')} style={{ cursor: 'pointer' }}>
          <i className="bi bi-book-half me-2"></i> Éducation
        </li>
        <li className="nav-link text-white mb-1" onClick={() => navigate('/objets')} style={{ cursor: 'pointer' }}>
          <i className="bi bi-smartwatch me-2"></i> Objets connectés
        </li>
        <li className="nav-link text-white" onClick={() => navigate('/aide')} style={{ cursor: 'pointer' }}>
          <i className="bi bi-question-circle-fill me-2"></i> Aide
        </li>
        <li className="nav-link text-white" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <i className="bi bi-box-arrow-right me-2"></i> Se déconnecter
        </li>
      </ul>
    </div>
  );
}

export default SidebarPatient;
