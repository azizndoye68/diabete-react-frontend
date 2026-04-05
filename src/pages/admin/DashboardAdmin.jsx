// src/pages/admin/DashboardAdmin.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import TopbarAdmin from "../../components/TopbarAdmin";
import AideModal from "../../components/AideModal";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./DashboardAdmin.css";

function DashboardAdmin() {
  const [admin, setAdmin] = useState(null);
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [attente, setAttente] = useState([]);
  const [showAide, setShowAide] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get("/api/auth/profile");
        setAdmin(profileRes.data);
        const [patientsRes, medecinsRes, attenteRes] = await Promise.all([
          api.get("/api/patients"),
          api.get("/api/medecins"),
          api.get("/api/auth/users/pending/all"),
        ]);
        setPatients(patientsRes.data);
        setMedecins(medecinsRes.data);
        setAttente(attenteRes.data);
      } catch (error) {
        console.error("Erreur lors du chargement du dashboard admin", error);
      }
    };
    fetchData();
  }, []);

  const totalUtilisateurs = patients.length + medecins.length;
  const tauxOccupation = medecins.length > 0 ? Math.round(patients.length / medecins.length) : 0;
  const tauxAttente = totalUtilisateurs > 0
    ? Math.round((attente.length / (totalUtilisateurs + attente.length)) * 100) : 0;
  const patientsAvecMedecin = patients.filter(p => p.medecinId).length;
  const patientsSansMedecin = patients.length - patientsAvecMedecin;
  const tauxRattachement = patients.length > 0
    ? Math.round((patientsAvecMedecin / patients.length) * 100) : 0;

  return (
    <div className="da-wrapper">
      <TopbarAdmin admin={admin} onShowAide={() => setShowAide(true)} />

      <div className="da-content">
        <Container fluid className="da-container">

          {/* ===== HERO ===== */}
          <div className="da-hero">
            <div className="da-hero-bg"></div>
            <div className="da-hero-inner">
              <div className="da-hero-left">
                <div className="da-hero-badge">
                  <i className="bi bi-shield-fill-check me-2"></i>
                  Panneau d'administration
                </div>
                <h1 className="da-hero-title">
                  Bonjour, <span className="da-hero-name">{admin?.username || "Admin"}</span>
                </h1>
                <p className="da-hero-date">
                  <i className="bi bi-calendar3 me-2"></i>
                  {currentTime.toLocaleDateString("fr-FR", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric"
                  })}
                </p>
              </div>
              <div className="da-hero-right">
                <div className="da-clock">
                  <div className="da-clock-time">
                    {currentTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </div>
                  <div className="da-clock-label">Heure locale</div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== KPI CARDS ===== */}
          <Row className="g-4 mb-4">
            {[
              {
                label: "Total patients", value: patients.length, icon: "bi-people-fill",
                gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                trend: `${tauxRattachement}% rattachés`, trendUp: tauxRattachement >= 50,
                onClick: () => navigate("/admin/patients"), delay: 0,
              },
              {
                label: "Médecins actifs", value: medecins.length, icon: "bi-person-badge-fill",
                gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                trend: `${tauxOccupation} patients/médecin`, trendUp: true,
                onClick: () => navigate("/admin/medecins"), delay: 100,
              },
              {
                label: "En attente validation", value: attente.length, icon: "bi-hourglass-split",
                gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
                trend: attente.length > 0 ? "Action requise" : "Tout traité",
                trendUp: attente.length === 0, urgent: attente.length > 0,
                onClick: () => navigate("/admin/attente"), delay: 200,
              },
              {
                label: "Total utilisateurs", value: totalUtilisateurs, icon: "bi-activity",
                gradient: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
                trend: "Médecins + Patients", trendUp: true, delay: 300,
              },
            ].map((kpi, i) => (
              <Col xl={3} md={6} key={i}>
                <Card
                  className={`da-kpi-card da-fade-in ${kpi.onClick ? "da-kpi-clickable" : ""} ${kpi.urgent ? "da-kpi-urgent" : ""}`}
                  onClick={kpi.onClick}
                  style={{ animationDelay: `${kpi.delay}ms` }}
                >
                  <Card.Body className="p-4">
                    <div className="da-kpi-top">
                      <div className="da-kpi-icon" style={{ background: kpi.gradient }}>
                        <i className={`bi ${kpi.icon}`}></i>
                      </div>
                      {kpi.urgent && <span className="da-urgent-dot"></span>}
                    </div>
                    <div className="da-kpi-value">{kpi.value}</div>
                    <div className="da-kpi-label">{kpi.label}</div>
                    <div className={`da-kpi-trend ${kpi.trendUp ? "trend-up" : "trend-neutral"}`}>
                      <i className={`bi ${kpi.trendUp ? "bi-arrow-up-right" : "bi-dash"} me-1`}></i>
                      {kpi.trend}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* ===== RANGÉE 2 ===== */}
          <Row className="g-4 mb-4">

            {/* Taux de rattachement */}
            <Col xl={4} md={6}>
              <Card className="da-card da-fade-in" style={{ animationDelay: "0.4s" }}>
                <Card.Body className="p-4">
                  <div className="da-card-header-row mb-3">
                    <h6 className="da-card-title">Rattachement patients</h6>
                    <div className="da-card-icon-sm" style={{ background: "linear-gradient(135deg, #11998e, #38ef7d)" }}>
                      <i className="bi bi-link-45deg"></i>
                    </div>
                  </div>
                  <div className="da-big-stat">
                    <span className="da-big-number" style={{ color: "#11998e" }}>{tauxRattachement}%</span>
                    <span className="da-big-label">des patients ont un médecin</span>
                  </div>
                  <div className="da-progress-track mt-3">
                    <div className="da-progress-fill" style={{ width: `${tauxRattachement}%`, background: "linear-gradient(90deg, #11998e, #38ef7d)" }}></div>
                  </div>
                  <div className="da-progress-labels mt-2">
                    <span style={{ color: "#11998e", fontWeight: 600 }}>{patientsAvecMedecin} rattachés</span>
                    <span className="text-muted">{patientsSansMedecin} sans médecin</span>
                  </div>
                  <button className="da-link-btn mt-3" onClick={() => navigate("/admin/patients")}>
                    Voir les patients <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                </Card.Body>
              </Card>
            </Col>

            {/* Donut répartition */}
            <Col xl={4} md={6}>
              <Card className="da-card da-fade-in" style={{ animationDelay: "0.5s" }}>
                <Card.Body className="p-4">
                  <div className="da-card-header-row mb-3">
                    <h6 className="da-card-title">Répartition plateforme</h6>
                    <div className="da-card-icon-sm" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                      <i className="bi bi-pie-chart-fill"></i>
                    </div>
                  </div>
                  <div className="da-donut-wrapper">
                    <div className="da-donut">
                      <svg viewBox="0 0 100 100" className="da-donut-svg">
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="14" />
                        {totalUtilisateurs > 0 && (
                          <>
                            <circle cx="50" cy="50" r="38" fill="none" stroke="url(#gp)" strokeWidth="14"
                              strokeDasharray={`${(patients.length / totalUtilisateurs) * 238.76} ${238.76 - (patients.length / totalUtilisateurs) * 238.76}`}
                              strokeDashoffset="59.69" strokeLinecap="round" />
                            <circle cx="50" cy="50" r="38" fill="none" stroke="url(#gm)" strokeWidth="14"
                              strokeDasharray={`${(medecins.length / totalUtilisateurs) * 238.76} ${238.76 - (medecins.length / totalUtilisateurs) * 238.76}`}
                              strokeDashoffset={`${59.69 - (patients.length / totalUtilisateurs) * 238.76}`}
                              strokeLinecap="round" />
                            <defs>
                              <linearGradient id="gp" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#11998e" /><stop offset="100%" stopColor="#38ef7d" />
                              </linearGradient>
                              <linearGradient id="gm" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#667eea" /><stop offset="100%" stopColor="#764ba2" />
                              </linearGradient>
                            </defs>
                          </>
                        )}
                      </svg>
                      <div className="da-donut-center">
                        <div className="da-donut-value">{totalUtilisateurs}</div>
                        <div className="da-donut-label">total</div>
                      </div>
                    </div>
                    <div className="da-donut-legend">
                      <div className="da-legend-item">
                        <span className="da-legend-dot" style={{ background: "#11998e" }}></span>
                        <span>Patients</span>
                        <strong>{patients.length}</strong>
                      </div>
                      <div className="da-legend-item">
                        <span className="da-legend-dot" style={{ background: "#667eea" }}></span>
                        <span>Médecins</span>
                        <strong>{medecins.length}</strong>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Actions requises */}
            <Col xl={4} md={12}>
              <Card className="da-card da-fade-in" style={{ animationDelay: "0.6s", height: "100%" }}>
                <Card.Body className="p-4">
                  <div className="da-card-header-row mb-3">
                    <h6 className="da-card-title">Actions requises</h6>
                    {attente.length > 0 && <span className="da-alert-badge">{attente.length}</span>}
                  </div>
                  <div className="da-actions-list">
                    <div className={`da-action-item ${attente.length > 0 ? "da-action-urgent" : "da-action-ok"}`} onClick={() => navigate("/admin/attente")}>
                      <div className="da-action-icon">
                        <i className={`bi ${attente.length > 0 ? "bi-hourglass-split" : "bi-check-circle-fill"}`}></i>
                      </div>
                      <div className="da-action-info">
                        <div className="da-action-title">
                          {attente.length > 0 ? `${attente.length} médecin${attente.length > 1 ? "s" : ""} en attente` : "Aucune demande en attente"}
                        </div>
                        <div className="da-action-sub">{attente.length > 0 ? "Validation requise" : "Tout est traité ✓"}</div>
                      </div>
                      {attente.length > 0 && <i className="bi bi-chevron-right da-action-arrow"></i>}
                    </div>
                    <div className="da-action-item da-action-info-item" onClick={() => navigate("/admin/patients")}>
                      <div className="da-action-icon"><i className="bi bi-person-x-fill"></i></div>
                      <div className="da-action-info">
                        <div className="da-action-title">{patientsSansMedecin} patient{patientsSansMedecin > 1 ? "s" : ""} sans médecin</div>
                        <div className="da-action-sub">À rattacher à un médecin</div>
                      </div>
                      <i className="bi bi-chevron-right da-action-arrow"></i>
                    </div>
                    <div className="da-action-item da-action-neutral" onClick={() => navigate("/admin/medecins")}>
                      <div className="da-action-icon"><i className="bi bi-person-badge-fill"></i></div>
                      <div className="da-action-info">
                        <div className="da-action-title">{medecins.length} médecin{medecins.length > 1 ? "s" : ""} actif{medecins.length > 1 ? "s" : ""}</div>
                        <div className="da-action-sub">Ratio : {tauxOccupation} patients/médecin</div>
                      </div>
                      <i className="bi bi-chevron-right da-action-arrow"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* ===== RANGÉE 3 ===== */}
          <Row className="g-4">

            {/* Accès rapide grille */}
            <Col xl={5} md={12}>
              <Card className="da-card da-fade-in" style={{ animationDelay: "0.7s" }}>
                <Card.Body className="p-4">
                  <h6 className="da-card-title mb-4">
                    <i className="bi bi-lightning-charge-fill me-2" style={{ color: "#f59e0b" }}></i>Accès rapide
                  </h6>
                  <div className="da-quick-grid">
                    {[
                      { icon: "bi-people-fill", label: "Patients", sub: `${patients.length} inscrits`, color: "#11998e", path: "/admin/patients" },
                      { icon: "bi-person-badge-fill", label: "Médecins", sub: `${medecins.length} actifs`, color: "#667eea", path: "/admin/medecins" },
                      { icon: "bi-hourglass-split", label: "En attente", sub: `${attente.length} demandes`, color: "#f59e0b", path: "/admin/attente" },
                      { icon: "bi-bar-chart-line-fill", label: "Statistiques", sub: "Analyses", color: "#0ea5e9", path: "/admin/statistiques" },
                      { icon: "bi-mortarboard-fill", label: "Éducation", sub: "Contenus", color: "#a855f7", path: "/medecin/education" },
                      { icon: "bi-person-circle", label: "Mon profil", sub: "Paramètres", color: "#64748b", path: "/admin/profile" },
                    ].map((item, i) => (
                      <div key={i} className="da-quick-item" onClick={() => navigate(item.path)}>
                        <div className="da-quick-icon" style={{ background: item.color + "18", color: item.color }}>
                          <i className={`bi ${item.icon}`}></i>
                        </div>
                        <div className="da-quick-label">{item.label}</div>
                        <div className="da-quick-sub">{item.sub}</div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Indicateurs de santé */}
            <Col xl={7} md={12}>
              <Card className="da-card da-fade-in" style={{ animationDelay: "0.8s" }}>
                <Card.Body className="p-4">
                  <h6 className="da-card-title mb-4">
                    <i className="bi bi-activity me-2" style={{ color: "#11998e" }}></i>Indicateurs de la plateforme
                  </h6>
                  <div className="da-indicators">
                    {[
                      {
                        label: "Taux de rattachement patients",
                        value: tauxRattachement, max: 100, unit: "%",
                        color: tauxRattachement >= 70 ? "#11998e" : "#f59e0b",
                        note: `${patientsAvecMedecin} / ${patients.length} patients`
                      },
                      {
                        label: "Charge moyenne par médecin",
                        value: tauxOccupation, max: Math.max(tauxOccupation * 2, 10), unit: " patients",
                        color: "#667eea",
                        note: `${patients.length} patients pour ${medecins.length} médecins`
                      },
                      {
                        label: "Taux de demandes en attente",
                        value: tauxAttente, max: 100, unit: "%",
                        color: tauxAttente > 20 ? "#f59e0b" : "#11998e",
                        note: `${attente.length} demande${attente.length > 1 ? "s" : ""} à valider`
                      },
                      {
                        label: "Couverture médicale",
                        value: medecins.length > 0 ? Math.min(100, Math.round((medecins.length / Math.max(patients.length, 1)) * 100 * 5)) : 0,
                        max: 100, unit: "%", color: "#0ea5e9",
                        note: `1 médecin pour ${tauxOccupation || "—"} patients`
                      },
                    ].map((ind, i) => {
                      const pct = Math.min(100, Math.round((ind.value / Math.max(ind.max, 1)) * 100));
                      return (
                        <div className="da-indicator-row" key={i}>
                          <div className="da-indicator-header">
                            <span className="da-indicator-label">{ind.label}</span>
                            <span className="da-indicator-value" style={{ color: ind.color }}>{ind.value}{ind.unit}</span>
                          </div>
                          <div className="da-indicator-track">
                            <div className="da-indicator-fill" style={{ width: `${pct}%`, background: ind.color }}></div>
                          </div>
                          <div className="da-indicator-note">{ind.note}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="da-summary-strip mt-4">
                    {[
                      { val: patients.length, lbl: "Patients", color: "#11998e" },
                      { val: medecins.length, lbl: "Médecins", color: "#667eea" },
                      { val: attente.length, lbl: "En attente", color: "#f59e0b" },
                      { val: totalUtilisateurs, lbl: "Utilisateurs", color: "#0ea5e9" },
                    ].map((s, i) => (
                      <React.Fragment key={i}>
                        <div className="da-summary-item">
                          <span className="da-summary-val" style={{ color: s.color }}>{s.val}</span>
                          <span className="da-summary-lbl">{s.lbl}</span>
                        </div>
                        {i < 3 && <div className="da-summary-divider"></div>}
                      </React.Fragment>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

        </Container>
      </div>

      <AideModal show={showAide} onHide={() => setShowAide(false)} />
    </div>
  );
}

export default DashboardAdmin;