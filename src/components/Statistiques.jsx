// src/pages/Statistiques.jsx
import React, { useEffect, useState } from 'react';
import {
  Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell, ComposedChart, Area, ReferenceLine
} from 'recharts';
import { Col, Row, Card } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import SidebarPatient from './SidebarPatient';
import api from '../services/api';

// 🔵 Définition des plages de glycémie adaptées au design violet
const PLAGES = {
  hypo: { max: 0.7, color: '#ffc107', label: 'Hypoglycémie', range: '< 0.7 g/L' },
  normal: { min: 0.7, max: 1.2, color: '#13a649', label: 'Normale', range: '0.7 - 1.2 g/L' },
  hyper: { min: 1.2, color: '#dc3545', label: 'Hyperglycémie', range: '> 1.2 g/L' },
};

// 🟢 Couleur selon glycémie
const getColor = (value) => {
  if (value < PLAGES.hypo.max) return PLAGES.hypo.color;
  if (value <= PLAGES.normal.max) return PLAGES.normal.color;
  return PLAGES.hyper.color;
};

// 🟡 Tooltip personnalisé moderne
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const gly = payload[0].value;
    const color = getColor(gly);
    let status = '';
    
    if (gly < 0.7) status = 'Faible ⚠️';
    else if (gly <= 1.2) status = 'Normal ✓';
    else status = 'Élevé ⚠️';
    
    return (
      <div style={{
        background: 'white',
        border: `3px solid ${color}`,
        padding: '12px 16px',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#333' }}>{label}</p>
        <p style={{ margin: '4px 0', fontSize: '1.3rem', fontWeight: 'bold', color }}>
          {gly} g/L
        </p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{status}</p>
      </div>
    );
  }
  return null;
};

function Statistiques() {
  const { patientId } = useParams();
  const [data, setData] = useState([]);
  const [patient, setPatient] = useState(null);
  const [stats, setStats] = useState({ moyenne: 0, min: 0, max: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        let realPatientId;
        let patientData;

        if (patientId) {
          const patientRes = await api.get(`/api/patients/${patientId}`);
          patientData = patientRes.data;
          realPatientId = patientId;
        } else {
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

        // Calculer les statistiques
        if (formatted.length > 0) {
          const values = formatted.map(d => d.glycemie);
          setStats({
            moyenne: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
            min: Math.min(...values).toFixed(2),
            max: Math.max(...values).toFixed(2)
          });
        }
      } catch (error) {
        console.error('❌ Erreur de récupération des statistiques :', error);
      }
    };

    fetchData();
  }, [patientId]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%)' }}>
      <SidebarPatient patient={patient} isMedecin={!!patientId} />

      <div style={{ marginLeft: '280px', padding: '2rem 3rem' }}>
        {/* En-tête */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '2rem',
          borderRadius: '20px',
          marginBottom: '2rem',
          color: 'white'
        }}>
          <h2 className="mb-2">📊 Statistiques de Glycémie</h2>
          <p className="mb-0" style={{ opacity: 0.9 }}>
            {patient && `${patient.prenom} ${patient.nom}`}
          </p>
        </div>

        {/* Cartes de statistiques rapides */}
        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card style={{
              border: '2px solid #667eea',
              borderRadius: '16px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
            }}>
              <Card.Body className="text-center p-4">
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <i className="bi bi-graph-up" style={{ fontSize: '1.8rem', color: 'white' }}></i>
                </div>
                <h6 className="text-muted mb-2">Moyenne</h6>
                <h3 className="mb-0" style={{ color: '#667eea', fontWeight: 'bold' }}>
                  {stats.moyenne} <small style={{ fontSize: '1rem' }}>g/L</small>
                </h3>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card style={{
              border: '2px solid #ffc107',
              borderRadius: '16px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
            }}>
              <Card.Body className="text-center p-4">
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <i className="bi bi-arrow-down-circle" style={{ fontSize: '1.8rem', color: 'white' }}></i>
                </div>
                <h6 className="text-muted mb-2">Minimum</h6>
                <h3 className="mb-0" style={{ color: '#ffc107', fontWeight: 'bold' }}>
                  {stats.min} <small style={{ fontSize: '1rem' }}>g/L</small>
                </h3>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card style={{
              border: '2px solid #dc3545',
              borderRadius: '16px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
            }}>
              <Card.Body className="text-center p-4">
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <i className="bi bi-arrow-up-circle" style={{ fontSize: '1.8rem', color: 'white' }}></i>
                </div>
                <h6 className="text-muted mb-2">Maximum</h6>
                <h3 className="mb-0" style={{ color: '#dc3545', fontWeight: 'bold' }}>
                  {stats.max} <small style={{ fontSize: '1rem' }}>g/L</small>
                </h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Légende moderne */}
        <Card className="mb-4" style={{
          border: '2px solid #667eea',
          borderRadius: '16px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
        }}>
          <Card.Body className="p-4">
            <h6 className="fw-bold mb-3" style={{ color: '#667eea' }}>
              <i className="bi bi-palette me-2"></i>
              Guide de lecture
            </h6>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {Object.values(PLAGES).map((plage, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1.25rem',
                  background: `${plage.color}15`,
                  borderRadius: '12px',
                  border: `2px solid ${plage.color}`
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: plage.color
                  }}></div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#333' }}>{plage.label}</div>
                    <small style={{ color: '#666' }}>{plage.range}</small>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* 📈 Courbe d'évolution */}
        <Card className="mb-4" style={{
          border: '2px solid #667eea',
          borderRadius: '16px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
        }}>
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-4" style={{ color: '#667eea' }}>
              <i className="bi bi-graph-up-arrow me-2"></i>
              Évolution sur les 7 derniers jours
            </h5>
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorGly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  
                  <ReferenceLine y={0.7} stroke="#667eea" strokeDasharray="5 5" strokeWidth={2} />
                  <ReferenceLine y={1.2} stroke="#667eea" strokeDasharray="5 5" strokeWidth={2} />
                  
                  <XAxis dataKey="date" tick={{ fill: '#666' }} />
                  <YAxis domain={[0, 2]} tick={{ fill: '#666' }} />
                  <Tooltip content={<CustomTooltip />} />
                  
                  <Area type="monotone" dataKey="glycemie" stroke="none" fill="url(#colorGly)" />
                  
                  <Line
                    type="monotone"
                    dataKey="glycemie"
                    stroke="#667eea"
                    strokeWidth={3}
                    dot={({ cx, cy, payload }) => (
                      <g>
                        <circle cx={cx} cy={cy} r={10} fill={getColor(payload.glycemie)} opacity={0.2} />
                        <circle cx={cx} cy={cy} r={6} stroke="white" strokeWidth={2} fill={getColor(payload.glycemie)} />
                      </g>
                    )}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-5">
                <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                <p className="text-muted mt-3">Aucune donnée disponible</p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* 📊 Histogramme */}
        {data.length > 0 && (
          <Card style={{
            border: '2px solid #667eea',
            borderRadius: '16px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
          }}>
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4" style={{ color: '#667eea' }}>
                <i className="bi bi-bar-chart-fill me-2"></i>
                Distribution des mesures
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" tick={{ fill: '#666' }} />
                  <YAxis domain={[0, 2]} tick={{ fill: '#666' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="glycemie" radius={[8, 8, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={index} fill={getColor(entry.glycemie)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
}

export default Statistiques;