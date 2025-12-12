// src/components/EquipeSoignante.jsx
import React, { useEffect, useState } from "react";
import { Form, Button, Card, ListGroup } from "react-bootstrap";
import SidebarPatient from "./SidebarPatient";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "./EquipeSoignante.css";

export default function EquipeSoignante() {
  const [patient, setPatient] = useState(null);
  const [medecinPrincipal, setMedecinPrincipal] = useState(null);
  const [equipe, setEquipe] = useState([]);
  const [codeSuivi, setCodeSuivi] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const profileRes = await api.get("/api/auth/profile");
        const utilisateurId = profileRes.data.id;
        const patientRes = await api.get(`/api/patients/byUtilisateur/${utilisateurId}`);
        setPatient(patientRes.data);

        // Si le patient a déjà un médecin
        if (patientRes.data.medecinId) {
          const medRes = await api.get(`/api/medecins/${patientRes.data.medecinId}`);
          setMedecinPrincipal(medRes.data);

          // Charger l'équipe du médecin référent
          const equipeRes = await api.get(`/api/equipes/medecin/${medRes.data.id}`);
          if (equipeRes.data.length > 0) {
            const equipeId = equipeRes.data[0].id;

            const medecinsRes = await api.get(`/api/equipes/${equipeId}/medecins`, {
              headers: { medecinId: medRes.data.id },
            });

            setEquipe(medecinsRes.data);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  // 🔥🔥 Correction — aucune modification UI, seulement logique API 🔥🔥
  // 🔥 Correction définitive — conforme au backend
const handleRattacher = async () => {
  if (!codeSuivi.trim()) return alert("Veuillez entrer un code de suivi.");

  try {
    // Profil utilisateur
    const profileRes = await api.get("/api/auth/profile");
    const utilisateurId = profileRes.data.id;

    // On récupère le patient associé
    const patientRes = await api.get(`/api/patients/byUtilisateur/${utilisateurId}`);
    const patientId = patientRes.data.id;

    // 👉 Le backend attend:
    // PATCH /api/patients/{patientId}/rattacher-medecin?numeroProfessionnelMedecin=XXXX
    await api.patch(
      `/api/patients/${patientId}/rattacher-medecin`,
      {},
      { params: { numeroProfessionnelMedecin: codeSuivi } }
    );

    alert("Médecin rattaché avec succès !");
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert(
      err?.response?.data?.message ||
        "Erreur lors du rattachement. Vérifiez le code."
    );
  }
};

  const handleDiscuterEquipe = () => navigate("/chat-groupe");

  const handleDiscuterMedecin = () => {
    if (medecinPrincipal) navigate(`/chat-prive/${medecinPrincipal.id}`);
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="equipe-soignante-page">
      <SidebarPatient patient={patient} />

      <div className="main-content p-4">
        <h2 className="mb-4">Équipe soignante</h2>

        {!patient.medecinId ? (
          <Card className="p-4 shadow-sm" style={{ maxWidth: "500px" }}>
            <h5>Rattacher un médecin</h5>
            <Form.Group className="mb-3">
              <Form.Label>Code de suivi</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrez le code de suivi fourni par votre médecin"
                value={codeSuivi}
                onChange={(e) => setCodeSuivi(e.target.value)}
              />
            </Form.Group>
            <Button onClick={handleRattacher} variant="success">
              Rattacher
            </Button>
          </Card>
        ) : (
          <>
            <Card className="mb-4 shadow-sm p-3" style={{ maxWidth: "600px" }}>
              <h5>Médecin référent</h5>
              <p>
                Dr {medecinPrincipal.prenom} {medecinPrincipal.nom} <br />
                Spécialité : {medecinPrincipal.specialite} <br />
                Téléphone : {medecinPrincipal.telephone} <br />
                Email : {medecinPrincipal.email}
              </p>
              <Button variant="primary" onClick={handleDiscuterMedecin}>
                Discuter avec le médecin
              </Button>
            </Card>

            {equipe.length > 0 && (
              <Card className="mb-4 shadow-sm p-3" style={{ maxWidth: "600px" }}>
                <h5>Équipe soignante</h5>
                <ListGroup>
                  {equipe.map((med) => (
                    <ListGroup.Item key={med.id}>
                      Dr {med.prenom} {med.nom} <br />
                      Spécialité : {med.specialite} <br />
                      Téléphone : {med.telephone} <br />
                      Email : {med.email}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <Button className="mt-3" variant="success" onClick={handleDiscuterEquipe}>
                  Discuter avec l'équipe
                </Button>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
