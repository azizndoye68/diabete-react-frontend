// src/pages/admin/DashboardAdmin.jsx
import React, { useEffect, useState } from "react";
import AideModal from "../../components/AideModal";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./DashboardAdmin.css";
import SidebarAdmin from "../../components/SidebarAdmin";

function DashboardAdmin() {
  const [admin, setAdmin] = useState(null);
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [attente, setAttente] = useState([]);
  const [showAide, setShowAide] = useState(false);
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

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
        setPatients(patientsRes.data || []);
        setMedecins(medecinsRes.data || []);
        const attenteData = attenteRes.data;
        setAttente(Array.isArray(attenteData) ? attenteData : attenteData?.content || []);
      } catch (error) {
        console.error("Erreur dashboard admin", error);
      }
    };
    fetchData();
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalUtilisateurs    = patients.length + medecins.length;
  const patientsAvecMedecin  = patients.filter(p => p.medecinId).length;
  const patientsSansMedecin  = patients.length - patientsAvecMedecin;
  const tauxRattachement     = patients.length > 0 ? Math.round((patientsAvecMedecin / patients.length) * 100) : 0;
  const tauxOccupation       = medecins.length > 0 ? Math.round(patients.length / medecins.length) : 0;

  const formatTime = (d) => d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatDate = (d) => d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const kpis = [
    {
      label: "Patients",
      value: patients.length,
      icon: "bi-people-fill",
      accent: "#10b981",
      bg: "#ecfdf5",
      desc: `${patientsAvecMedecin} rattachés`,
      onClick: () => navigate("/admin/patients"),
    },
    {
      label: "Médecins actifs",
      value: medecins.length,
      icon: "bi-person-badge-fill",
      accent: "#6366f1",
      bg: "#eef2ff",
      desc: `${tauxOccupation} patients / médecin`,
      onClick: () => navigate("/admin/medecins"),
    },
    {
      label: "En attente",
      value: attente.length,
      icon: "bi-hourglass-split",
      accent: attente.length > 0 ? "#f59e0b" : "#10b981",
      bg: attente.length > 0 ? "#fffbeb" : "#ecfdf5",
      desc: attente.length > 0 ? "Validation requise" : "Tout traité ✓",
      urgent: attente.length > 0,
      onClick: () => navigate("/admin/attente"),
    },
    {
      label: "Total utilisateurs",
      value: totalUtilisateurs,
      icon: "bi-person-check-fill",
      accent: "#0ea5e9",
      bg: "#f0f9ff",
      desc: "Médecins + Patients",
    },
  ];

  return (
    <div className="da-wrapper">
      <SidebarAdmin admin={admin} onShowAide={() => setShowAide(true)} />

      <div className="da-content">
        <div className="da-container">

          {/* ── TOPBAR ── */}
          <div className="da-topbar">
            <div className="da-topbar-left">
              <p className="da-topbar-date">
                <i className="bi bi-calendar3 me-2"></i>{formatDate(time)}
              </p>
              <h1 className="da-topbar-title">
                Bonjour, <span className="da-topbar-name">{admin?.username || "Admin"}</span>
              </h1>
            </div>
            <div className="da-topbar-right">
              <div className="da-clock-box">
                <i className="bi bi-clock me-2 da-clock-icon"></i>
                <span className="da-clock-time">{formatTime(time)}</span>
              </div>
              {attente.length > 0 && (
                <button className="da-alert-pill" onClick={() => navigate("/admin/attente")}>
                  <span className="da-alert-dot"></span>
                  {attente.length} demande{attente.length > 1 ? "s" : ""} en attente
                  <i className="bi bi-arrow-right ms-2"></i>
                </button>
              )}
            </div>
          </div>

          {/* ── KPI GRID ── */}
          <div className="da-kpi-grid">
            {kpis.map((kpi, i) => (
              <div
                key={i}
                className={`da-kpi ${kpi.onClick ? "da-kpi--clickable" : ""} ${kpi.urgent ? "da-kpi--urgent" : ""}`}
                onClick={kpi.onClick}
                style={{ "--accent": kpi.accent, "--bg": kpi.bg, animationDelay: `${i * 70}ms` }}
              >
                <div className="da-kpi-icon-wrap">
                  <i className={`bi ${kpi.icon}`}></i>
                  {kpi.urgent && <span className="da-kpi-dot"></span>}
                </div>
                <div className="da-kpi-body">
                  <div className="da-kpi-val">{kpi.value}</div>
                  <div className="da-kpi-lbl">{kpi.label}</div>
                  <div className="da-kpi-desc">{kpi.desc}</div>
                </div>
                {kpi.onClick && (
                  <i className="bi bi-arrow-right da-kpi-arrow"></i>
                )}
              </div>
            ))}
          </div>

          {/* ── ROW 2 ── */}
          <div className="da-row2">

            {/* Rattachement patients */}
            <div className="da-panel">
              <div className="da-panel-head">
                <div className="da-panel-icon" style={{ background: "#ecfdf5", color: "#10b981" }}>
                  <i className="bi bi-link-45deg"></i>
                </div>
                <div>
                  <div className="da-panel-title">Rattachement patients</div>
                  <div className="da-panel-sub">Patients avec un médecin référent</div>
                </div>
              </div>
              <div className="da-panel-body">
                <div className="da-ratio-row">
                  <span className="da-ratio-num" style={{ color: "#10b981" }}>{tauxRattachement}%</span>
                  <span className="da-ratio-lbl">des patients sont rattachés</span>
                </div>
                <div className="da-bar-track">
                  <div className="da-bar-fill da-bar-fill--green" style={{ width: `${tauxRattachement}%` }}></div>
                </div>
                <div className="da-bar-legend">
                  <span className="da-legend-green">
                    <i className="bi bi-check-circle-fill me-1"></i>{patientsAvecMedecin} rattachés
                  </span>
                  <span className="da-legend-gray">
                    <i className="bi bi-x-circle me-1"></i>{patientsSansMedecin} sans médecin
                  </span>
                </div>
                <button className="da-panel-link" onClick={() => navigate("/admin/patients")}>
                  Gérer les patients <i className="bi bi-arrow-right ms-1"></i>
                </button>
              </div>
            </div>

            {/* Répartition */}
            <div className="da-panel">
              <div className="da-panel-head">
                <div className="da-panel-icon" style={{ background: "#eef2ff", color: "#6366f1" }}>
                  <i className="bi bi-pie-chart-fill"></i>
                </div>
                <div>
                  <div className="da-panel-title">Répartition plateforme</div>
                  <div className="da-panel-sub">Composition des utilisateurs</div>
                </div>
              </div>
              <div className="da-panel-body">
                <div className="da-donut-wrap">
                  <div className="da-donut-ring">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="14"/>
                      {totalUtilisateurs > 0 && <>
                        <defs>
                          <linearGradient id="gp2"><stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#34d399"/></linearGradient>
                          <linearGradient id="gm2"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#818cf8"/></linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="38" fill="none" stroke="url(#gp2)" strokeWidth="14"
                          strokeDasharray={`${(patients.length/totalUtilisateurs)*238.76} ${238.76-(patients.length/totalUtilisateurs)*238.76}`}
                          strokeDashoffset="59.69" strokeLinecap="round"/>
                        <circle cx="50" cy="50" r="38" fill="none" stroke="url(#gm2)" strokeWidth="14"
                          strokeDasharray={`${(medecins.length/totalUtilisateurs)*238.76} ${238.76-(medecins.length/totalUtilisateurs)*238.76}`}
                          strokeDashoffset={`${59.69-(patients.length/totalUtilisateurs)*238.76}`} strokeLinecap="round"/>
                      </>}
                    </svg>
                    <div className="da-donut-center">
                      <div className="da-donut-num">{totalUtilisateurs}</div>
                      <div className="da-donut-txt">total</div>
                    </div>
                  </div>
                  <div className="da-donut-legend">
                    <div className="da-dl-item">
                      <span className="da-dl-dot" style={{ background: "#10b981" }}></span>
                      <span className="da-dl-lbl">Patients</span>
                      <strong className="da-dl-val">{patients.length}</strong>
                    </div>
                    <div className="da-dl-item">
                      <span className="da-dl-dot" style={{ background: "#6366f1" }}></span>
                      <span className="da-dl-lbl">Médecins</span>
                      <strong className="da-dl-val">{medecins.length}</strong>
                    </div>
                    {totalUtilisateurs > 0 && (
                      <div className="da-dl-item">
                        <span className="da-dl-dot" style={{ background: "#e2e8f0" }}></span>
                        <span className="da-dl-lbl">Ratio</span>
                        <strong className="da-dl-val">{tauxOccupation} pts/méd.</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions requises */}
            <div className="da-panel">
              <div className="da-panel-head">
                <div className="da-panel-icon" style={{ background: "#fffbeb", color: "#f59e0b" }}>
                  <i className="bi bi-lightning-charge-fill"></i>
                </div>
                <div>
                  <div className="da-panel-title">Actions requises</div>
                  <div className="da-panel-sub">Points nécessitant votre attention</div>
                </div>
                {attente.length > 0 && <span className="da-badge-urgent">{attente.length}</span>}
              </div>
              <div className="da-panel-body">
                <div className="da-action-list">

                  <div
                    className={`da-action ${attente.length > 0 ? "da-action--warn" : "da-action--ok"}`}
                    onClick={() => navigate("/admin/attente")}
                  >
                    <div className="da-action-ico">
                      <i className={`bi ${attente.length > 0 ? "bi-hourglass-split" : "bi-check-circle-fill"}`}></i>
                    </div>
                    <div className="da-action-text">
                      <div className="da-action-ttl">
                        {attente.length > 0
                          ? `${attente.length} médecin${attente.length > 1 ? "s" : ""} en attente`
                          : "Aucune demande en attente"}
                      </div>
                      <div className="da-action-sub">
                        {attente.length > 0 ? "Validation requise" : "Tout est traité ✓"}
                      </div>
                    </div>
                    <i className="bi bi-chevron-right da-action-chev"></i>
                  </div>

                  <div className="da-action da-action--info" onClick={() => navigate("/admin/patients")}>
                    <div className="da-action-ico">
                      <i className="bi bi-person-x-fill"></i>
                    </div>
                    <div className="da-action-text">
                      <div className="da-action-ttl">{patientsSansMedecin} patient{patientsSansMedecin !== 1 ? "s" : ""} sans médecin</div>
                      <div className="da-action-sub">À rattacher à un médecin</div>
                    </div>
                    <i className="bi bi-chevron-right da-action-chev"></i>
                  </div>

                  <div className="da-action da-action--neutral" onClick={() => navigate("/admin/medecins")}>
                    <div className="da-action-ico">
                      <i className="bi bi-person-badge-fill"></i>
                    </div>
                    <div className="da-action-text">
                      <div className="da-action-ttl">{medecins.length} médecin{medecins.length !== 1 ? "s" : ""} actif{medecins.length !== 1 ? "s" : ""}</div>
                      <div className="da-action-sub">Ratio : {tauxOccupation} patients / médecin</div>
                    </div>
                    <i className="bi bi-chevron-right da-action-chev"></i>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* ── ROW 3 ── */}
          <div className="da-row3">

            {/* Accès rapide */}
            <div className="da-panel">
              <div className="da-panel-head">
                <div className="da-panel-icon" style={{ background: "#fffbeb", color: "#f59e0b" }}>
                  <i className="bi bi-grid-fill"></i>
                </div>
                <div>
                  <div className="da-panel-title">Accès rapide</div>
                  <div className="da-panel-sub">Navigation vers les sections</div>
                </div>
              </div>
              <div className="da-panel-body">
                <div className="da-quick-grid">
                  {[
                    { icon: "bi-people-fill",         label: "Patients",     info: `${patients.length}`,          color: "#10b981", bg: "#ecfdf5", path: "/admin/patients" },
                    { icon: "bi-person-badge-fill",   label: "Médecins",     info: `${medecins.length}`,          color: "#6366f1", bg: "#eef2ff", path: "/admin/medecins" },
                    { icon: "bi-hourglass-split",     label: "En attente",   info: `${attente.length}`,           color: "#f59e0b", bg: "#fffbeb", path: "/admin/attente" },
                    { icon: "bi-bar-chart-line-fill", label: "Statistiques", info: "Analyses",                    color: "#0ea5e9", bg: "#f0f9ff", path: "/admin/statistiques" },
                    { icon: "bi-mortarboard-fill",    label: "Éducation",    info: "Contenus",                    color: "#a855f7", bg: "#faf5ff", path: "/medecin/education" },
                    { icon: "bi-person-circle",       label: "Mon profil",   info: "Paramètres",                  color: "#64748b", bg: "#f8fafc", path: "/admin/profile" },
                  ].map((item, i) => (
                    <div key={i} className="da-quick" style={{ "--qc": item.color, "--qbg": item.bg }} onClick={() => navigate(item.path)}>
                      <div className="da-quick-ico"><i className={`bi ${item.icon}`}></i></div>
                      <div className="da-quick-lbl">{item.label}</div>
                      <div className="da-quick-info">{item.info}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Indicateurs */}
            <div className="da-panel">
              <div className="da-panel-head">
                <div className="da-panel-icon" style={{ background: "#ecfdf5", color: "#10b981" }}>
                  <i className="bi bi-activity"></i>
                </div>
                <div>
                  <div className="da-panel-title">Indicateurs clés</div>
                  <div className="da-panel-sub">Santé globale de la plateforme</div>
                </div>
              </div>
              <div className="da-panel-body">

                {[
                  {
                    label: "Taux de rattachement",
                    value: tauxRattachement,
                    unit: "%",
                    max: 100,
                    color: tauxRattachement >= 70 ? "#10b981" : "#f59e0b",
                    note: `${patientsAvecMedecin} sur ${patients.length} patients`,
                  },
                  {
                    label: "Charge moyenne / médecin",
                    value: tauxOccupation,
                    unit: " pts",
                    max: Math.max(tauxOccupation * 2, 10),
                    color: "#6366f1",
                    note: `${patients.length} patients pour ${medecins.length} médecins`,
                  },
                  {
                    label: "Patients sans médecin",
                    value: patients.length > 0 ? Math.round((patientsSansMedecin / patients.length) * 100) : 0,
                    unit: "%",
                    max: 100,
                    color: patientsSansMedecin > 0 ? "#f59e0b" : "#10b981",
                    note: `${patientsSansMedecin} patient${patientsSansMedecin !== 1 ? "s" : ""} à rattacher`,
                  },
                ].map((ind, i) => {
                  const pct = Math.min(100, Math.round((ind.value / Math.max(ind.max, 1)) * 100));
                  return (
                    <div className="da-ind" key={i}>
                      <div className="da-ind-head">
                        <span className="da-ind-lbl">{ind.label}</span>
                        <span className="da-ind-val" style={{ color: ind.color }}>{ind.value}{ind.unit}</span>
                      </div>
                      <div className="da-ind-track">
                        <div className="da-ind-fill" style={{ width: `${pct}%`, background: ind.color }}></div>
                      </div>
                      <div className="da-ind-note">{ind.note}</div>
                    </div>
                  );
                })}

                <div className="da-strip">
                  {[
                    { val: patients.length,   lbl: "Patients",   color: "#10b981" },
                    { val: medecins.length,   lbl: "Médecins",   color: "#6366f1" },
                    { val: attente.length,    lbl: "En attente", color: "#f59e0b" },
                    { val: totalUtilisateurs, lbl: "Total",      color: "#0ea5e9" },
                  ].map((s, i) => (
                    <React.Fragment key={i}>
                      <div className="da-strip-item">
                        <span className="da-strip-val" style={{ color: s.color }}>{s.val}</span>
                        <span className="da-strip-lbl">{s.lbl}</span>
                      </div>
                      {i < 3 && <div className="da-strip-div"></div>}
                    </React.Fragment>
                  ))}
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      <AideModal show={showAide} onHide={() => setShowAide(false)} />
    </div>
  );
}

export default DashboardAdmin;