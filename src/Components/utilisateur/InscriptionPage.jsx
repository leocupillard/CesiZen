import { useState } from "react";
import {TextField,Button,Typography,Alert,Paper,createTheme,ThemeProvider, Box} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../../BDD/SupaBaseClient";



const theme = createTheme({
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#fbc02d",
            align: "center"
          },
        },
      },
    },
  },
});



export default function InscriptionPage() {
  const [formData, setFormData] = useState({
    pseudo: "",
    email: "",
    password: ""
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            pseudo: formData.pseudo,
          }
        }
      });

      if (error) throw error;

      const userId = data?.user?.id;
      if (!userId) throw new Error("Utilisateur non créé.");

      const { error: insertError } = await supabase
        .from("utilisateurs")
        .insert([
          {
            id: userId,
            pseudo: formData.pseudo,
            email: formData.email,
          }
        ]);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => navigate("/connexion"), 1500);
    } catch (err) {
      console.error("Erreur inscription :", err.message);
      setError(err.message);
    }
  }

  return (
    <ThemeProvider theme={theme}>
        <Box
            sx={{
                height: "100vh",          
                display: "flex",          
                justifyContent: "center", 
                alignItems: "center",     
                bgcolor: "#e0e0e0"       
            }}
            >
            <Paper
            elevation={3}
            sx={{
                p: 4,
                borderRadius: 4,
                maxWidth: 480,
                width: "100%",
                bgcolor:"#f8f8f8",
                textAlign: "center"
            }}
            >
            <Typography
                variant="h4"
                align="center"
                gutterBottom
                sx={{ color: "#388e3c", fontWeight: "bold" }} 
            >
                Inscription
            </Typography>

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                Inscription réussie !
                </Alert>
            )}

            <form onSubmit={handleSubmit}>

                <TextField
                fullWidth
                label="Pseudo"
                name="pseudo"
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
                required
                variant="outlined"
                error={formData.password.length > 0 && formData.password.length < 6}
                helperText={
                  formData.password.length > 0 && formData.password.length < 6
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
                  S'inscrire
                </Button>
            
            </form>

            <Link to="/Connexion">
                <Typography
                  sx={{ mt: 2, cursor: "pointer", color: "#388e3c", align: "center" }}
                >
                  Se connecter
                </Typography>
            </Link>
            </Paper>
        </Box>
    </ThemeProvider>
  );
}
