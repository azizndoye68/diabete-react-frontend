// src/pages/PatientDossier.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import "./PatientDossier.css";
import { Table, Badge, Card } from "react-bootstrap";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

export default function PatientDossier() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [suivis, setSuivis] = useState([]);
  const [rappels, setRappels] = useState([]);

  // -----------------------------
  // CHARGEMENT COMPLET DU DOSSIER
  // -----------------------------
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        // Infos patient
        const res = await api.get(`/api/patients/${id}`);
        const patientData = res.data;

        // Médecin référent
        let medecinPrenom = null;
        let medecinNom = null;

        if (patientData.medecinId) {
          try {
            const med = await api.get(`/api/medecins/${patientData.medecinId}`);
            medecinPrenom = med.data?.prenom ?? null;
            medecinNom = med.data?.nom ?? null;
          } catch (e) {
            console.error("Erreur médecin référent :", e);
          }
        }

        setPatient({ ...patientData, medecinPrenom, medecinNom });

        // Suivi glycémique
        const suivisRes = await api.get(`/api/suivis/recentes?patientId=${id}`);
        setSuivis(suivisRes.data);

        // Rappels
        const rappelsRes = await api.get(`/api/rappels?patientId=${id}`);
        setRappels(rappelsRes.data);
      } catch (err) {
        console.error("Erreur chargement dossier patient :", err);
      }
    };

    fetchPatient();
  }, [id]);

  if (!patient) return <p>Chargement...</p>;

  // -----------------------------
  // NORMALISATION DES TEXTES
  // -----------------------------
  const formatMoment = (moment) => {
    if (!moment) return "—";
    return moment
      .replace("_", " ")
      .replace("avant", "Avant")
      .replace("apres", "Après")
      .replace("repas", " repas");
  };

  const formatRepas = (repas) => {
    if (!repas) return "—";
    return repas.charAt(0).toUpperCase() + repas.slice(1);
  };

  const getBadgeColor = (value) => {
    if (value < 0.7) return "danger";     // Hypoglycémie sévère
    if (value < 1) return "warning";      // Valeur basse
    if (value > 2) return "danger";       // Hypoglycémie sévère
    return "success";                     // Normal
  };

  // Données du graphique
  const chartData = suivis.map((s) => ({
    date: s.dateSuivi.split("T")[0],
    glycemie: s.glycemie,
  }));

  // -----------------------------
  // AFFICHAGE DU DOSSIER MÉDICAL
  // -----------------------------
  return (
    <div className="patient-dossier container my-4">

      <h2 className="mb-4">
        🩺 Dossier médical de {patient.prenom} {patient.nom}
      </h2>

      {/* Informations générales */}
      <Card className="mb-4 shadow-sm">
        <Card.Header><strong>Informations personnelles</strong></Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-4">
              <p><strong>Nom complet :</strong> {patient.prenom} {patient.nom}</p>
              <p><strong>Date de naissance :</strong> {patient.dateNaissance}</p>
              <p><strong>Sexe :</strong> {patient.sexe}</p>
            </div>

            <div className="col-md-4">
              <p><strong>Téléphone :</strong> {patient.telephone || "—"}</p>
              <p><strong>Adresse :</strong> {patient.adresse || "—"}</p>
              <p><strong>Ville / Région :</strong> {patient.ville || "—"} / {patient.region || "—"}</p>
            </div>

            <div className="col-md-4">
              <p><strong>Numéro de dossier :</strong> {patient.numeroDossier}</p>
              <p><strong>Date d'inscription :</strong> {patient.dateEnregistrement || "—"}</p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Informations médicales */}
      <Card className="mb-4 shadow-sm">
        <Card.Header><strong>Informations médicales</strong></Card.Header>
        <Card.Body>
          <p><strong>Type de diabète :</strong> {patient.typeDiabete || "—"}</p>
          <p><strong>Traitement :</strong> {patient.traitement || "—"}</p>
          <p>
            <strong>Médecin référent :</strong>{" "}
            {patient.medecinPrenom ? `Dr ${patient.medecinPrenom} ${patient.medecinNom}` : "—"}
          </p>
        </Card.Body>
      </Card>

      {/* Suivi glycémique */}
      <Card className="mb-4 shadow-sm">
        <Card.Header><strong>Suivi glycémique récent</strong></Card.Header>
        <Card.Body>

          {suivis.length === 0 ? (
            <p>Aucune mesure enregistrée.</p>
          ) : (
            <>
              {/* Graphique */}
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="glycemie" stroke="#198754" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>

              {/* Tableau détaillé */}
              <Table striped bordered hover size="sm" className="mt-3">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Moment</th>
                    <th>Repas</th>
                    <th>Glycémie (g/L)</th>
                    <th>Symptômes</th>
                    <th>Événements</th>
                  </tr>
                </thead>

                <tbody>
                  {suivis.map((s) => (
                    <tr key={s.id}>
                      <td>{s.dateSuivi.split("T")[0]}</td>
                      <td>{formatMoment(s.moment)}</td>
                      <td>{formatRepas(s.repas)}</td>

                      <td>
                        <Badge bg={getBadgeColor(s.glycemie)}>{s.glycemie}</Badge>
                      </td>

                      <td>{s.symptomes || "—"}</td>
                      <td>{s.evenements || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}

        </Card.Body>
      </Card>

      {/* Rappels */}
      <Card className="mb-4 shadow-sm">
        <Card.Header><strong>Rappels & Rendez-vous</strong></Card.Header>
        <Card.Body>
          {rappels.length === 0 ? (
            <p>Aucun rappel programmé.</p>
          ) : (
            <ul>
              {rappels.map((r) => (
                <li key={r.id}>
                  <strong>{r.date}</strong> — {r.description}
                </li>
              ))}
            </ul>
          )}
        </Card.Body>
      </Card>

    </div>
  );
}
