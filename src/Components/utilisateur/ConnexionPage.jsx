import { useState } from "react";
import { TextField, Button,Paper, Typography, Alert, createTheme, ThemeProvider, Box } from "@mui/material";
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
          },
        },
      },
    },
  },
});



export default function ConnexionPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      setError(authError.message || "Email ou mot de passe incorrect.");
      return;
    }

    const userId = data.user.id;

    const { data: userData, error: userError } = await supabase
      .from("utilisateurs")
      .select("active")
      .eq("id", userId)
      .single();

    if (userError) {
      setError("Erreur lors de la vérification du compte.");
      return;
    }

    if (!userData.active) {
      await supabase.auth.signOut(); 
      setError("Votre compte est désactivé. Veuillez contacter l'administrateur.");
      return;
    }

    navigate("/");
  };



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
            Connexion
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
            />
            <TextField
                fullWidth
                label="Mot de passe"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
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
              Se connecter
            </Button>
            </form>
            <Link to="/Inscription">
                <Typography
                    sx={{ mt: 2, cursor: "pointer", color: "#388e3c"}}
                >
                    Créer mon Compte
                </Typography>
            </Link>  
        </Paper>
        </Box>
    </ThemeProvider>
  );
}
