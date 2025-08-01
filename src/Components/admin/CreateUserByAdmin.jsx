import { useState } from "react";
import {TextField,Button,Typography,Alert,Paper,createTheme,ThemeProvider, Box, FormControl, InputLabel, Select, MenuItem} from "@mui/material";
import { useNavigate } from "react-router-dom";
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



export default function CreateUserByAdmin() {
  const [formData, setFormData] = useState({
    pseudo: "",
    email: "",
    password: "",
    role: ""
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
            role: formData.role
          }
        }
      });

      if (error) throw error;

      const userId = data?.user?.id;
      if (!userId) throw new Error("Utilisateur déjà existant.");

      const { error: insertError } = await supabase
        .from("utilisateurs")
        .insert([
          {
            id: userId,
            pseudo: formData.pseudo,
            email: formData.email,
            role: formData.role
          }
        ]);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => navigate("/ADMIN_page"), 1500);
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
                Nouvel utilisateur
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
                <FormControl fullWidth margin="normal" required variant="outlined">
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                        labelId="role-label"
                        label="Role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <MenuItem value="citoyen">citoyen</MenuItem>
                        <MenuItem value="admin">admin</MenuItem>
                    </Select>
                    </FormControl>

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
                  inscrire un nouvel utilisateur
                </Button>
            
            </form>
            </Paper>
        </Box>
    </ThemeProvider>
  );
}
