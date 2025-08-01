import { Typography, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import supabase from "../../BDD/SupaBaseClient";

export default function GererUtilisateur({ utilisateurs, refresh }) {
  const navigate = useNavigate();

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    const { error: favError } = await supabase
      .from('favoris')
      .delete()
      .eq('id_utilisateur', userId);

    if (favError) {
      console.error('Erreur suppression favoris:', favError.message);
      return;
    }

    const { error: userError } = await supabase
      .from('utilisateurs')
      .delete()
      .eq('id', userId);

    if (userError) {
      console.error('Erreur suppression utilisateur:', userError.message);
      return;
    }
    refresh();
  };

  const toggleVisibility = async (id, currentActive) => {
    const { error } = await supabase
      .from("utilisateurs")
      .update({ active: !currentActive })
      .eq("id", id);
    if (!error) refresh();
  };

  function handleOpenPopup() {
  navigate('/CreateUserByAdmin'); 
}

  return (
    <>
      <Typography variant="h4" gutterBottom color="green" align="center" sx={{ mt: 10}}>
        Liste des utilisateurs
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleOpenPopup}
        sx={{
            mb: 2,
            backgroundColor: "green", 
            '&:hover': {
            backgroundColor: "#062B16", 
            },
        }}
        >
        Créer un utilisateur
        </Button>

      <TableContainer component={Paper} >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Pseudo</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Rôle</strong></TableCell>
              <TableCell align="right"><strong>Gérer</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {utilisateurs.map((user) => (
              <TableRow key={user.id} sx={{ backgroundColor: user.active ? "inherit" : "#f0f0f0", opacity: user.active ? 1 : 0.6 }}>
                <TableCell>{user.pseudo}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell align="right">
                  <Button onClick={() => toggleVisibility(user.id, user.active)} sx={{ color: "black", minWidth: 0, ml: 1 }}>
                    {user.active ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                  </Button>
                  <Button onClick={() => handleDeleteUser(user.id)} sx={{ color: "red", minWidth: 0, ml: 1 }}>
                    <DeleteIcon fontSize="small" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
