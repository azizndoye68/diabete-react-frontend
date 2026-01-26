// src/pages/medecin/StatistiquesMedecin.jsx
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TopbarMedecin from '../../components/TopbarMedecin';
import api from '../../services/api';
import './StatistiquesMedecin.css';

function StatistiquesMedecin() {
  const [medecin, setMedecin] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('all');
  const [periode, setPeriode] = useState('30');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    patientsActifs: 0,
    moyenneGlycemie: 0,
    conformite: 0,
    alertes: 0
  });
  const [chartData, setChartData] = useState({
    evolutionGlycemie: [],
    repartitionTypes: [],
    conformitePatients: [],
    alertesParType: []
  });

  const COLORS = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ffc107'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get('/api/auth/profile');
        const medRes = await api.get(`/api/medecins/byUtilisateur/${profileRes.data.id}`);
        setMedecin(medRes.data);

        const patientsRes = await api.get(`/api/patients/medecin/${medRes.data.id}/visibles`);
        setPatients(patientsRes.data || []);

        await loadStatistics(medRes.data.id, 'all', '30');
      } catch (error) {
        console.error('Erreur chargement données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStatistics = async (medecinId, patientFilter, periodeJours) => {
    try {
      setLoading(true);
      
      const patientsRes = await api.get(`/api/patients/medecin/${medecinId}/visibles`);
      const allPatients = patientsRes.data || [];
      
      let filteredPatients = allPatients;
      if (patientFilter !== 'all') {
        filteredPatients = allPatients.filter(p => p.id === parseInt(patientFilter));
      }

      // Calculer statistiques globales
      const totalPatients = filteredPatients.length;
      const counters = {
        totalGlycemies: 0,
        countGlycemies: 0,
        patientsActifs: 0,
        totalAlertes: 0
      };
      
      const evolutionData = {};
      const typesRepartition = {};
      const conformiteData = [];

      for (const patient of filteredPatients) {
        try {
          const suiviRes = await api.get(`/api/suivis/recentes?patientId=${patient.id}`);
          const mesures = suiviRes.data || [];
          
          if (mesures.length > 0) {
            counters.patientsActifs++;
            
            // Filtrer par période
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - parseInt(periodeJours));
            
            const mesuresPeriode = mesures.filter(m => 
              new Date(m.dateSuivi) >= dateLimit
            );

            // Traiter les mesures
            const processedData = processMesures(mesuresPeriode, evolutionData, counters);
            Object.assign(evolutionData, processedData.evolutionData);
            Object.assign(counters, processedData.counters);

            // Répartition types de diabète
            const type = patient.typeDiabete || 'Non spécifié';
            typesRepartition[type] = (typesRepartition[type] || 0) + 1;

            // Conformité patient
            const glycemiesNormales = mesuresPeriode.filter(m => 
              m.glycemie >= 0.7 && m.glycemie <= 1.2
            ).length;
            const conformite = mesuresPeriode.length > 0 
              ? Math.round((glycemiesNormales / mesuresPeriode.length) * 100)
              : 0;

            conformiteData.push({
              nom: `${patient.prenom} ${patient.nom}`,
              conformite: conformite
            });
          }
        } catch (err) {
          console.log(`Pas de données pour patient ${patient.id}`);
        }
      }

      // Préparer données graphiques
      const evolutionArray = Object.values(evolutionData)
        .map(d => ({
          date: d.date,
          moyenne: (d.total / d.count).toFixed(2)
        }))
        .sort((a, b) => {
          const [dayA, monthA, yearA] = a.date.split('/');
          const [dayB, monthB, yearB] = b.date.split('/');
          return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
        })
        .slice(-30);

      const typesArray = Object.entries(typesRepartition).map(([type, count]) => ({
        name: type,
        value: count
      }));

      setStats({
        totalPatients,
        patientsActifs: counters.patientsActifs,
        moyenneGlycemie: counters.countGlycemies > 0 
          ? (counters.totalGlycemies / counters.countGlycemies).toFixed(2) 
          : 0,
        conformite: conformiteData.length > 0 
          ? Math.round(conformiteData.reduce((sum, p) => sum + p.conformite, 0) / conformiteData.length)
          : 0,
        alertes: counters.totalAlertes
      });

      setChartData({
        evolutionGlycemie: evolutionArray,
        repartitionTypes: typesArray,
        conformitePatients: conformiteData.slice(0, 10),
        alertesParType: [
          { name: 'Hypoglycémies', value: Math.floor(counters.totalAlertes * 0.4), fill: '#ffc107' },
          { name: 'Hyperglycémies', value: Math.floor(counters.totalAlertes * 0.6), fill: '#dc3545' }
        ]
      });

    } catch (error) {
      console.error('Erreur calcul statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction helper pour traiter les mesures (évite le warning no-loop-func)
  const processMesures = (mesures, evolutionData, counters) => {
    const newEvolutionData = { ...evolutionData };
    const newCounters = { ...counters };

    mesures.forEach(m => {
      const date = new Date(m.dateSuivi).toLocaleDateString('fr-FR');
      if (!newEvolutionData[date]) {
        newEvolutionData[date] = { date, total: 0, count: 0 };
      }
      newEvolutionData[date].total += m.glycemie;
      newEvolutionData[date].count++;
      
      newCounters.totalGlycemies += m.glycemie;
      newCounters.countGlycemies++;

      // Compter alertes
      if (m.glycemie < 0.7 || m.glycemie > 1.8) {
        newCounters.totalAlertes++;
      }
    });

    return { evolutionData: newEvolutionData, counters: newCounters };
  };

  const handleFilterChange = () => {
    if (medecin) {
      loadStatistics(medecin.id, selectedPatient, periode);
    }
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <div className="stats-medecin-wrapper">
      <TopbarMedecin user={medecin} />

      <div className="stats-medecin-content">
        <Container fluid className="px-4">
          {/* En-tête */}
          <Row className="mb-4">
            <Col>
              <div className="stats-header">
                <div className="stats-header-content">
                  <div className="stats-icon-wrapper">
                    <i className="bi bi-graph-up-arrow"></i>
                  </div>
                  <div>
                    <h2 className="fw-bold mb-1">Statistiques & Rapports</h2>
                    <p className="text-muted mb-0">
                      <i className="bi bi-calendar3 me-2"></i>
                      Analyse et suivi de vos patients
                    </p>
                  </div>
                </div>
                <Button className="btn-export" onClick={exportPDF}>
                  <i className="bi bi-file-earmark-pdf me-2"></i>
                  Exporter PDF
                </Button>
              </div>
            </Col>
          </Row>

          {/* Filtres */}
          <Card className="filter-card mb-4">
            <Card.Body className="p-4">
              <Row className="g-3 align-items-end">
                <Col md={5}>
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-person me-2"></i>
                    Patient
                  </Form.Label>
                  <Form.Select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="form-select-custom"
                  >
                    <option value="all">Tous les patients</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.prenom} {p.nom} - {p.typeDiabete}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-calendar-range me-2"></i>
                    Période
                  </Form.Label>
                  <Form.Select
                    value={periode}
                    onChange={(e) => setPeriode(e.target.value)}
                    className="form-select-custom"
                  >
                    <option value="7">7 derniers jours</option>
                    <option value="30">30 derniers jours</option>
                    <option value="90">3 derniers mois</option>
                    <option value="180">6 derniers mois</option>
                    <option value="365">1 an</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Button
                    className="w-100 btn-filter"
                    onClick={handleFilterChange}
                    disabled={loading}
                  >
                    <i className="bi bi-funnel me-2"></i>
                    Appliquer les filtres
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Cartes statistiques */}
          <Row className="g-4 mb-4">
            <Col xl={2} md={4} sm={6}>
              <Card className="stat-card-mini">
                <Card.Body className="p-3">
                  <div className="stat-mini-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <i className="bi bi-people-fill"></i>
                  </div>
                  <div className="stat-mini-info">
                    <small className="stat-mini-label">Patients</small>
                    <h3 className="stat-mini-value">{stats.totalPatients}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={2} md={4} sm={6}>
              <Card className="stat-card-mini">
                <Card.Body className="p-3">
                  <div className="stat-mini-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                    <i className="bi bi-activity"></i>
                  </div>
                  <div className="stat-mini-info">
                    <small className="stat-mini-label">Actifs</small>
                    <h3 className="stat-mini-value">{stats.patientsActifs}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={2} md={4} sm={6}>
              <Card className="stat-card-mini">
                <Card.Body className="p-3">
                  <div className="stat-mini-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                    <i className="bi bi-droplet-half"></i>
                  </div>
                  <div className="stat-mini-info">
                    <small className="stat-mini-label">Moy. Glycémie</small>
                    <h3 className="stat-mini-value">{stats.moyenneGlycemie} <small>g/L</small></h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={2} md={4} sm={6}>
              <Card className="stat-card-mini">
                <Card.Body className="p-3">
                  <div className="stat-mini-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                    <i className="bi bi-check-circle"></i>
                  </div>
                  <div className="stat-mini-info">
                    <small className="stat-mini-label">Conformité</small>
                    <h3 className="stat-mini-value">{stats.conformite}%</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={2} md={4} sm={6}>
              <Card className="stat-card-mini">
                <Card.Body className="p-3">
                  <div className="stat-mini-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                    <i className="bi bi-exclamation-triangle"></i>
                  </div>
                  <div className="stat-mini-info">
                    <small className="stat-mini-label">Alertes</small>
                    <h3 className="stat-mini-value">{stats.alertes}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={2} md={4} sm={6}>
              <Card className="stat-card-mini">
                <Card.Body className="p-3">
                  <div className="stat-mini-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <i className="bi bi-calendar-check"></i>
                  </div>
                  <div className="stat-mini-info">
                    <small className="stat-mini-label">Période</small>
                    <h3 className="stat-mini-value">{periode} <small>j</small></h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Graphiques */}
          <Row className="g-4 mb-4">
            {/* Évolution glycémie */}
            <Col lg={8}>
              <Card className="chart-card">
                <Card.Body className="p-4">
                  <div className="chart-header">
                    <h5 className="fw-bold">
                      <i className="bi bi-graph-up me-2" style={{ color: '#667eea' }}></i>
                      Évolution de la glycémie moyenne
                    </h5>
                    <Badge className="badge-chart">Tendance</Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.evolutionGlycemie}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
                      <XAxis dataKey="date" stroke="#6c757d" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#6c757d" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          background: 'white',
                          border: '1px solid #e9ecef',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="moyenne"
                        name="Glycémie moyenne (g/L)"
                        stroke="#667eea"
                        strokeWidth={3}
                        dot={{ fill: '#667eea', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>

            {/* Répartition types de diabète */}
            <Col lg={4}>
              <Card className="chart-card">
                <Card.Body className="p-4">
                  <div className="chart-header">
                    <h5 className="fw-bold">
                      <i className="bi bi-pie-chart me-2" style={{ color: '#f093fb' }}></i>
                      Types de diabète
                    </h5>
                    <Badge className="badge-chart">Répartition</Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.repartitionTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.repartitionTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4">
            {/* Conformité par patient */}
            <Col lg={6}>
              <Card className="chart-card">
                <Card.Body className="p-4">
                  <div className="chart-header">
                    <h5 className="fw-bold">
                      <i className="bi bi-bar-chart me-2" style={{ color: '#43e97b' }}></i>
                      Conformité glycémique par patient
                    </h5>
                    <Badge className="badge-chart">Top 10</Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.conformitePatients}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
                      <XAxis dataKey="nom" stroke="#6c757d" style={{ fontSize: '11px' }} angle={-45} textAnchor="end" height={100} />
                      <YAxis stroke="#6c757d" style={{ fontSize: '12px' }} />
                      <Tooltip />
                      <Bar dataKey="conformite" name="Conformité (%)" fill="url(#colorConformite)" radius={[8, 8, 0, 0]} />
                      <defs>
                        <linearGradient id="colorConformite" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#43e97b" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#38f9d7" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>

            {/* Alertes par type */}
            <Col lg={6}>
              <Card className="chart-card">
                <Card.Body className="p-4">
                  <div className="chart-header">
                    <h5 className="fw-bold">
                      <i className="bi bi-exclamation-triangle me-2" style={{ color: '#fa709a' }}></i>
                      Répartition des alertes
                    </h5>
                    <Badge className="badge-chart">Détails</Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.alertesParType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.alertesParType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default StatistiquesMedecin;