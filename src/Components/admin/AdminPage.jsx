import { useEffect, useState } from "react";
import { Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import supabase from "../../BDD/SupaBaseClient";
import GererUtilisateur from "./GererUtilisateur";
import GererActivite from "./GererActivite";
import GererInformation from "./GererInformation";

export default function AdminPage() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [activites, setActivites] = useState([]);
  const [informations, setInformations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const fetchAdminPage = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    setUser(user);

    const { data: utilisateurs, error: listError } = await supabase.from("utilisateurs").select("*");
    const { data: activites, error: activiteError } = await supabase
      .from("activites")
      .select(`*, createur:utilisateurs(pseudo)`);
      const { data: informations, error: informationError } = await supabase
      .from("informations")
      .select(`*, createur:utilisateurs(pseudo)`);

    if (listError) setError("Erreur chargement utilisateurs");
    else setUtilisateurs(utilisateurs);

    if (activiteError) setError("Erreur chargement activités");
    else setActivites(activites);

    if (informationError) setError("Erreur chargement informations");
    else setInformations(informations);

    setLoading(false);
  };

  useEffect(() => {
    fetchAdminPage();
  }, []);

  if (loading) {
    return (
      <Container sx={{ mt: 5 }}>
        <Typography align="center">Chargement...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 5 }}>
      {error && (
        <Typography color="error" align="center" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <GererUtilisateur utilisateurs={utilisateurs} refresh={fetchAdminPage} />
      <GererActivite activites={activites} user={user} refresh={fetchAdminPage} />
      <GererInformation informations={informations} user={user} refresh={fetchAdminPage} />
    </Container>
  );
}
