import { createTheme, ThemeProvider, Typography, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import supabase from "../../BDD/SupaBaseClient";
import { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

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

export default function GererActivite({ activites, user, refresh }) {
  const [popupOpen, setPopupOpen] = useState(false);
  const [form, setForm] = useState({
    titre: "",
    description: "",
    contenu: "",
    image: "",
    source: ""
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const handleOpenPopup = () => {
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setForm({
      titre: "",
      description: "",
      contenu: "",
      image: "",
      source: ""
    });
    setIsEditMode(false);
    setEditId(null);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmitActivite = async () => {
    const { titre, description, contenu, source, image, file } = form;

    if (!titre.trim() || !description.trim() || !contenu.trim() || !source.trim()) {
      alert("Tous les champs sont obligatoires.");
      return;
    }

    let uploadedImagePath = image;

    if (file) {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `activites/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Erreur d'upload :", uploadError.message);
        alert("Erreur lors de l'upload de l'image.");
        return;
      }

      uploadedImagePath = filePath;
    }

    const dataToSend = {
      titre,
      description,
      contenu,
      source,
      image: uploadedImagePath,
      ...(isEditMode ? {} : { createur: user.id }),
    };

    let result;
    if (isEditMode) {
      result = await supabase
        .from("activites")
        .update(dataToSend)
        .eq("id", editId);
    } else {
      result = await supabase
        .from("activites")
        .insert([dataToSend]);
    }

    if (result.error) {
      console.error("Erreur Supabase :", result.error.message, result.error.details);
      alert("Erreur Supabase : " + result.error.message);
      return;
    }

    handleClosePopup();
    refresh();
  };

  const handleEditActivite = (activite) => {
    setForm({
      titre: activite.titre || "",
      description: activite.description || "",
      contenu: activite.contenu || "",
      image: activite.image || "",
      source: activite.source || ""
    });
    setEditId(activite.id);
    setIsEditMode(true);
    setPopupOpen(true);
  };

  const handleDeleteActivite = async (act) => {
    if (!window.confirm("Supprimer cette activité ?")) return;

    const imagePath = act.image;
    if (imagePath) {
      const { error: deleteError } = await supabase.storage
        .from("images")
        .remove([imagePath]);

      if (deleteError) {
        console.error("Erreur suppression image :", deleteError.message);
      }
    }

    const { error } = await supabase.from("activites").delete().eq("id", act.id);
    if (error) {
      console.error("Erreur suppression :", error.message);
      alert("Erreur lors de la suppression.");
      return;
    }
    refresh();
  };

  const VisibilityActivite = async (id, currentVisible) => {
    const { error } = await supabase
      .from("activites")
      .update({ visible: !currentVisible })
      .eq("id", id);
    if (!error) refresh();
  };

  return (
    <>
      <Typography variant="h4" gutterBottom color="green" align="center" sx={{ mt: 15 }}>
        Liste des activités
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
        Créer une activité
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Image</strong></TableCell>
              <TableCell><strong>Titre</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Créateur</strong></TableCell>
              <TableCell align="right"><strong>Gérer</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activites.map((act) => (
              <TableRow key={act.id} sx={{ backgroundColor: act.visible ? "inherit" : "#f0f0f0", opacity: act.visible ? 1 : 0.6 }}>
                <TableCell>
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
                <TableCell>{act.description}</TableCell>
                <TableCell>{act.createur?.pseudo || "N/A"}</TableCell>
                <TableCell align="right">
                  <Button onClick={() => VisibilityActivite(act.id, act.visible)} sx={{ color: "black", minWidth: 0, ml: 1 }}>
                    {act.visible ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                  </Button>
                  <Button onClick={() => handleEditActivite(act)} sx={{ minWidth: 0 }}>
                    <EditIcon fontSize="small" />
                  </Button>
                  <Button onClick={() => handleDeleteActivite(act)} sx={{ color: "red", minWidth: 0 }}>
                    <DeleteIcon fontSize="small" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ThemeProvider theme={theme}>
        <Dialog open={popupOpen} onClose={handleClosePopup} maxWidth="md" fullWidth sx={{ minWidth: 300, p: 2 }}>
          <DialogTitle sx={{textAlign: "center"}}>{isEditMode ? "Modifier l'activité" : "Créer une activité"}</DialogTitle>
          <DialogContent>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
            />
            <TextField
              label="Titre"
              name="titre"
              value={form.titre}
              onChange={handleFormChange}
              fullWidth
              sx={{ mt: 2, mb: 2 }}
            />
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleFormChange}
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 2 }}
            />
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Contenu</Typography>
            <CKEditor
              editor={ClassicEditor}
              data={form.contenu}
              onChange={(event, editor) => {
                const data = editor.getData();
                setForm({ ...form, contenu: data });
              }}
            />
            <TextField
              label="Source"
              name="source"
              value={form.source}
              onChange={handleFormChange}
              fullWidth
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePopup}>Annuler</Button>
            <Button onClick={handleSubmitActivite} variant="contained" color={isEditMode ? "primary" : "success"}>
              {isEditMode ? "Modifier" : "Créer"}
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </>
  );
}