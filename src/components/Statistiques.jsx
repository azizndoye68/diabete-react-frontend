// src/pages/Statistiques.jsx
import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell
} from 'recharts';
import { Col, Row } from 'react-bootstrap';
import SidebarPatient from '../components/SidebarPatient';
import api from '../services/api';

// 🔵 Fonction pour déterminer la couleur selon la glycémie
const getColor = (value) => {
  if (value < 0.7) return '#f44336';      // Rouge
  if (value <= 1.2) return '#4caf50';     // Vert
  if (value <= 1.4) return '#ffc107';     // Jaune
  return '#f44336';                       // Rouge si > 1.4
};

function Statistiques() {
  const [periode, setPeriode] = useState(7); // par défaut 7 jours
  const [allData, setAllData] = useState([]);

  // 🔄 Filtrage selon la période sélectionnée
  const filteredData = allData.filter(entry => {
    const entryDate = new Date(entry.rawDate);
    const limite = new Date();
    limite.setDate(limite.getDate() - periode);
    return entryDate >= limite;
  });

  useEffect(() => {
    const fetchMesures = async () => {
      try {
        const profile = await api.get('/api/auth/profile');
        const res = await api.get(`/api/suivis/recentes?patientId=${profile.data.id}`);

        const formatted = res.data.map(m => ({
          rawDate: m.dateSuivi, // pour le filtrage
          date: new Date(m.dateSuivi).toLocaleDateString('fr-FR'),
          glycemie: parseFloat(m.glycemie),
        }));
        setAllData(formatted);
      } catch (error) {
        console.error('Erreur de récupération des mesures :', error);
      }
    };

    fetchMesures();
  }, []);

  return (
    <Row className="m-0 vh-100">
      <SidebarPatient />

      <Col md={{ span: 9, offset: 3 }} className="p-5">
        <h3 className="mb-4">Statistiques de glycémie</h3>

        {/* 🎛️ Sélecteur de période */}
        <div className="mb-4">
          <label htmlFor="periodeSelect" className="form-label">Choisir la période :</label>
          <select
            id="periodeSelect"
            className="form-select"
            value={periode}
            onChange={(e) => setPeriode(parseInt(e.target.value))}
          >
            <option value={7}>7 derniers jours</option>
            <option value={30}>30 derniers jours</option>
            <option value={90}>3 derniers mois</option>
          </select>
        </div>

        <h5>Variation glycémique</h5>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData}>
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 2]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="glycemie"
              stroke="#8884d8"
              dot={({ cx, cy, payload }) => (
                <circle
                  cx={cx}
                  cy={cy}
                  r={6}
                  stroke="#000"
                  strokeWidth={1}
                  fill={getColor(payload.glycemie)}
                />
              )}
            />
          </LineChart>
        </ResponsiveContainer>

        <h5 className="mt-5">Histogramme des valeurs</h5>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 2]} />
            <Tooltip />
            <Bar
              dataKey="glycemie"
              label={{ position: 'top' }}
              radius={[5, 5, 0, 0]}
            >
              {
                filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.glycemie)} />
                ))
              }
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Col>
    </Row>
  );
}

export default Statistiques;
