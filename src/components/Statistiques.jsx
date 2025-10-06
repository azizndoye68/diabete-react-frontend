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
  if (value <= 1.2) return '#4caf50';      // Vert
  if (value <= 1.4) return '#ffc107';      // Jaune
  return '#f44336';                        // Rouge si > 1.4
};

function Statistiques() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchMesures = async () => {
      try {
        const profile = await api.get('/api/auth/profile');
        const res = await api.get(`/api/suivis/recentes?patientId=${profile.data.id}`);
        const formatted = res.data.map(m => ({
          date: new Date(m.dateSuivi).toLocaleDateString('fr-FR'),
          glycemie: parseFloat(m.glycemie),
        }));
        setData(formatted);
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

        <h5>Variation sur les 7 derniers jours</h5>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
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

        <h5 className="mt-5">Barres colorées des valeurs</h5>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
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
                data.map((entry, index) => (
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
