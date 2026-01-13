// src/pages/Statistiques.jsx
import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell, Legend
} from 'recharts';
import { Col, Row, Card, Badge } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import SidebarPatient from './SidebarPatient';
import api from '../services/api';

// 🔵 Définition des plages de glycémie (en g/L)
const PLAGES = {
  hypo: { max: 0.7, color: '#f44336', label: 'Hypoglycémie (< 0.7 g/L)' },
  normal: { min: 0.7, max: 1.2, color: '#4caf50', label: 'Normale (0.7 - 1.2 g/L)' },
  limite: { min: 1.2, max: 1.4, color: '#ffc107', label: 'Limite haute (1.2 - 1.4 g/L)' },
  hyper: { min: 1.4, color: '#e53935', label: 'Hyperglycémie (> 1.4 g/L)' },
};

// 🟢 Couleur selon glycémie
const getColor = (value) => {
  if (value < PLAGES.hypo.max) return PLAGES.hypo.color;
  if (value <= PLAGES.normal.max) return PLAGES.normal.color;
  if (value <= PLAGES.limite.max) return PLAGES.limite.color;
  return PLAGES.hyper.color;
};

// 🟡 Tooltip personnalisé
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const gly = payload[0].value;
    const color = getColor(gly);
    return (
      <div style={{
        background: '#fff',
        border: `2px solid ${color}`,
        padding: '8px 12px',
        borderRadius: 8
      }}>
        <p style={{ margin: 0 }}><strong>{label}</strong></p>
        <p style={{ color, margin: 0 }}>{gly} g/L</p>
      </div>
    );
  }
  return null;
};

function Statistiques() {
  const { patientId } = useParams(); // 🔑 présent uniquement côté médecin
  const [data, setData] = useState([]);
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let realPatientId;
        let patientData;

        if (patientId) {
          // 🔹 CAS MÉDECIN
          const patientRes = await api.get(`/api/patients/${patientId}`);
          patientData = patientRes.data;
          realPatientId = patientId;
        } else {
          // 🔹 CAS PATIENT
          const profileRes = await api.get('/api/auth/profile');
          const utilisateurId = profileRes.data.id;

          const patientRes = await api.get(`/api/patients/byUtilisateur/${utilisateurId}`);
          patientData = patientRes.data;
          realPatientId = patientData.id;
        }

        setPatient(patientData);

        // 📊 Mesures glycémie
        const glycemieRes = await api.get(`/api/suivis/recentes?patientId=${realPatientId}`);
        const formatted = glycemieRes.data.map((m) => ({
          date: new Date(m.dateSuivi).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
          }),
          glycemie: parseFloat(m.glycemie),
        }));

        setData(formatted);
      } catch (error) {
        console.error('❌ Erreur de récupération des statistiques :', error);
      }
    };

    fetchData();
  }, [patientId]);

  return (
    <Row className="m-0 vh-100">
      <SidebarPatient patient={patient} isMedecin={!!patientId} />

      <Col md={{ span: 9, offset: 3 }} className="p-5 bg-light">
        <h3 className="mb-4">
          Statistiques de glycémie {patient && `de ${patient.prenom}`}
        </h3>

        {/* 🔹 Légende */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <h6 className="fw-bold mb-3">Signification des couleurs :</h6>
            {Object.values(PLAGES).map((plage, idx) => (
              <Badge
                key={idx}
                bg="light"
                text="dark"
                className="me-3 p-2 border"
                style={{ borderColor: plage.color, backgroundColor: `${plage.color}22` }}
              >
                <i className="bi bi-circle-fill me-2" style={{ color: plage.color }}></i>
                {plage.label}
              </Badge>
            ))}
          </Card.Body>
        </Card>

        {/* 📈 Courbe */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <h5 className="fw-bold mb-3">Évolution de la glycémie (7 derniers jours)</h5>
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={data}>
                  <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 2]} tickFormatter={(v) => `${v.toFixed(1)} g/L`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="glycemie"
                    stroke="#1976d2"
                    strokeWidth={3}
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
            ) : (
              <p className="text-muted">Aucune donnée de glycémie disponible.</p>
            )}
          </Card.Body>
        </Card>

        {/* 📊 Histogramme */}
        {data.length > 0 && (
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="fw-bold mb-3">Distribution des valeurs mesurées</h5>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 2]} tickFormatter={(v) => `${v.toFixed(1)} g/L`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="glycemie" radius={[6, 6, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={index} fill={getColor(entry.glycemie)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        )}
      </Col>
    </Row>
  );
}

export default Statistiques;
