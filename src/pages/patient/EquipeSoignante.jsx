// src/components/EquipeSoignante.jsx
import React, { useEffect, useState } from "react";
import { Form, Button, Card, ListGroup, Spinner } from "react-bootstrap";
import SidebarPatient from "../../components/SidebarPatient";
import { useNavigate } from "react-router-dom";
import * as patientService from "../../services/patientService";
import * as medecinService from "../../services/medecinService";
import "./EquipeSoignante.css";

export default function EquipeSoignante() {
  const [patient, setPatient] = useState(null);
  const [medecinPrincipal, setMedecinPrincipal] = useState(null);
  const [equipe, setEquipe] = useState([]);
  const [codeSuivi, setCodeSuivi] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingRattachement, setLoadingRattachement] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);

        const profile = await medecinService.getProfile();
        if (!profile?.id) return;

        const patientData = await patientService.getPatientByUtilisateurId(profile.id);
        setPatient(patientData);

        if (!patientData?.medecinId) return;

        const med = await medecinService.getMedecinById(patientData.medecinId);
        setMedecinPrincipal(med);

        const equipes = await medecinService.getEquipesDuMedecin(med.id);

        if (!Array.isArray(equipes) || equipes.length === 0) {
          setEquipe([]);
          return;
        }

        const equipeValide = equipes.find(
          e => Array.isArray(e.medecinsIds) && e.medecinsIds.length > 0
        );

        if (!equipeValide || !Array.isArray(equipeValide.medecinsIds)) {
          setEquipe([]);
          return;
        }

        const medecinsEquipe = await Promise.all(
          equipeValide.medecinsIds.map(id =>
            medecinService.getMedecinById(id).catch(() => null)
          )
        );

        setEquipe(
          medecinsEquipe.filter(m => m && m.id !== med.id)
        );

      } catch (err) {
        console.error("Erreur chargement équipe soignante :", err);
        setEquipe([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  const handleRattacher = async () => {
    if (!codeSuivi.trim()) {
      alert("Veuillez entrer un code de suivi.");
      return;
    }

    try {
      setLoadingRattachement(true);

      const profile = await medecinService.getProfile();
      const patientData = await patientService.getPatientByUtilisateurId(profile.id);

      await patientService.rattacherMedecin(patientData.id, codeSuivi);
      alert("Médecin rattaché avec succès !");

      const updatedPatient = await patientService.getPatientByUtilisateurId(profile.id);
      setPatient(updatedPatient);

      if (!updatedPatient?.medecinId) return;

      const med = await medecinService.getMedecinById(updatedPatient.medecinId);
      setMedecinPrincipal(med);

      const equipes = await medecinService.getEquipesDuMedecin(med.id);

      if (!Array.isArray(equipes) || equipes.length === 0) {
        setEquipe([]);
        return;
      }

      const equipeValide = equipes.find(
        e => Array.isArray(e.medecinsIds) && e.medecinsIds.length > 0
      );

      if (!equipeValide || !Array.isArray(equipeValide.medecinsIds)) {
        setEquipe([]);
        return;
      }

      const medecinsEquipe = await Promise.all(
        equipeValide.medecinsIds.map(id =>
          medecinService.getMedecinById(id).catch(() => null)
        )
      );

      setEquipe(
        medecinsEquipe.filter(m => m && m.id !== med.id)
      );

      setCodeSuivi("");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Erreur lors du rattachement.");
    } finally {
      setLoadingRattachement(false);
    }
  };

  const handleDiscuterEquipe = () => navigate("/chat-groupe");
  const handleDiscuterMedecin = () => {
    if (medecinPrincipal) navigate(`/chat-prive/${medecinPrincipal.id}`);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" /> Chargement...
      </div>
    );
  }

  return (
    <div className="equipe-soignante-page d-flex">
      <SidebarPatient patient={patient} />

      <div className="main-content p-4 flex-grow-1">
        <h2 className="mb-4">Équipe soignante</h2>

        {!patient?.medecinId ? (
          <Card className="p-4 shadow-sm" style={{ maxWidth: "500px" }}>
            <h5>Rattacher un médecin</h5>
            <Form.Group className="mb-3">
              <Form.Label>Code de suivi</Form.Label>
              <Form.Control
                value={codeSuivi}
                onChange={(e) => setCodeSuivi(e.target.value)}
              />
            </Form.Group>
            <Button
              onClick={handleRattacher}
              variant="success"
              disabled={loadingRattachement}
            >
              {loadingRattachement ? "Rattachement..." : "Rattacher"}
            </Button>
          </Card>
        ) : (
          <>
            <Card className="mb-4 shadow-sm p-3" style={{ maxWidth: "600px" }}>
              <h5>Médecin référent</h5>
              <p>
                Dr {medecinPrincipal?.prenom} {medecinPrincipal?.nom} <br />
                Spécialité : {medecinPrincipal?.specialite || "—"} <br />
                Téléphone : {medecinPrincipal?.telephone || "—"} <br />
              </p>
              <Button onClick={handleDiscuterMedecin}>
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
                      Spécialité : {med.specialite || "—"} <br />
                      Téléphone : {med.telephone || "—"} <br />
                      
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <Button className="mt-3" onClick={handleDiscuterEquipe}>
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
