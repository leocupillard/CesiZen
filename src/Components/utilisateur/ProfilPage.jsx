import { useEffect, useState } from "react";
import { TextField, Button, Typography, Alert, Paper, createTheme, ThemeProvider, Box,CircularProgress, TableBody, Table, TableRow, TableCell} from "@mui/material";
import supabase from "../../BDD/SupaBaseClient";
import { useNavigate } from "react-router-dom";

const theme = createTheme({
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#fbc02d"
          },
        },
      },
    },
  },
});

export default function ProfilPage() {
  const [formData, setFormData] = useState({ pseudo: "", email: "" });
  const [favoris, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserData() {
      const {data: { user }, error: authError } = await supabase.auth.getUser();

      console.log("ID de l'utilisateur connecté :", user.id);
      const { data, error } = await supabase
        .from("utilisateurs")
        .select("pseudo, email")
        .eq("id", user.id)
        .single();

      if (error) {
        setError("Impossible de charger les données.");
        console.error(error);
      } else {
        setFormData({
          pseudo: data.pseudo || "",
          email: data.email || "",
          password: data.password || ""
        });
      }

      setLoading(false);
    }

    fetchUserData();
  }, [navigate]);

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };




 async function handleSubmit(event) {
  event.preventDefault();
  setError("");
  setSuccess(false);

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    setError("Utilisateur non authentifié.");
    return;
  }

  const updates = {};

  if (formData.email && formData.email.trim() !== "" && formData.email !== user.email) {
    updates.email = formData.email.trim();
  }

  if (formData.password && formData.password.length >= 6) {
    updates.password = formData.password;
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateAuthError } = await supabase.auth.updateUser(updates);

    if (updateAuthError) {
      setError("Erreur lors de la mise à jour de l'authentification : " + updateAuthError.message);
      return;
    }
  }

  const { error: updateError } = await supabase
    .from("utilisateurs")
    .update({
      pseudo: formData.pseudo,
      email: formData.email
    })
    .eq("id", user.id);

  if (updateError) {
    setError("Échec de la mise à jour des données utilisateur.");
    console.error(updateError);
  } else {
    setSuccess(true);
  }
}




  useEffect(() => {
    const fetchFavorites = async () => {
        setLoading(true);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user) {
          setFavorites([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("favoris")
          .select(`
            activites (
              id,
              titre,
              image,
              description,
              contenu,
              source
            )
          `)
          .eq("id_utilisateur", user.id);

        if (error) {
          console.error("Erreur chargement favoris :", error.message);
          setFavorites([]);
        } else {
          const likedActivities = data.map(fav => fav.activites);
          setFavorites(likedActivities);
        }
        setLoading(false);
      };

      fetchFavorites();
    }, []);



  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erreur lors de la déconnexion :", error.message);
    }
    navigate("/connexion");
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#ffffffff"
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 4,
            maxWidth: 480,
            width: "100%",
            bgcolor: "#f8f8f8",
            textAlign: "center",
            mt: 10,
            mb: 4
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ color: "#388e3c", fontWeight: "bold" }}
          >
            Profil
          </Typography>

          {loading ? (
            <CircularProgress color="success" />
          ) : (
            <>
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Profil mis à jour !
                </Alert>
              )}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Pseudo"
                  name="pseudo"
                  value={formData.pseudo}
                  onChange={handleChange}
                  margin="normal"
                  required
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  required
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Mot de passe"
                  name="password"
                  type="password"
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  error={!!formData.password && formData.password.length < 6}
                  helperText={
                    formData.password > 0 && formData.password.length < 6
                      ? "Le mot de passe doit contenir au moins 6 caractères."
                      : ""
                  }
                  />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 3,
                    py: 1.5,
                    bgcolor: "#388e3c",
                    color: "#fff",
                    fontWeight: "bold",
                    borderRadius: 3,
                    "&:hover": {
                      bgcolor: "#2e7d32",
                    },
                  }}
                >
                  Mettre à jour
                </Button>
              </form>

              <Typography
                onClick={handleLogout}
                sx={{
                  mt: 2,
                  cursor: "pointer",
                  color: "#388e3c",
                  textDecoration: "underline",
                }}
              >
                Se déconnecter
              </Typography>
            </>
          )}
        </Paper>


        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 4,
            maxWidth: 480,
            width: "100%",
            bgcolor: "#f8f8f8",
            textAlign: "center"
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ color: "#388e3c", fontWeight: "bold" }}
          >
            Vos activités favorites
          </Typography>


          <Table>
            <TableBody>
              {favoris.map((act) => (
              <TableRow key={act.id} onClick={() => navigate("/activite", { state: { act } })} sx={{textAlign:"center", cursor: "pointer"}}>
                <TableCell key={act} sx={{textAlign:"center"}}>
                  {act.image ? (
                        <img 
                        src={`https://brtumvrxurcpytdajejx.supabase.co/storage/v1/object/public/images/${act.image}`} 
                        alt={act.titre} 
                        style={{ maxWidth: "150px", maxHeight: "100px", objectFit: "contain" }}
                        />
                    ) : (
                        "Pas d'image"
                    )}
                </TableCell>
                <TableCell>{act.titre}</TableCell>
              </TableRow>
            ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
