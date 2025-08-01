import { createTheme, ThemeProvider, Typography, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
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


export default function GererInformation({ informations, user, refresh }) {
  const [popupOpen, setPopupOpen] = useState(false);
  const [form, setForm] = useState({
    titre: "",
    description: "",
    contenu: "",
    image: "",
    file: null,
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
      file: null,
    });
    setIsEditMode(false);
    setEditId(null);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { titre, description, contenu, image, file } = form;

    if (!titre.trim() || !description.trim() || !contenu.trim()) {
        alert("Tous les champs sont obligatoires sont obligatoires.");
        return;
    }

    let uploadedImagePath = image;

    if (file) {
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `informations/${fileName}`;

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
        image: uploadedImagePath,
        ...(isEditMode ? {} : { createur: user.id })
    };

    let result;
    if (isEditMode) {
        result = await supabase
        .from("informations")
        .update(dataToSend)
        .eq("id", editId);
    } else {
        result = await supabase
        .from("informations")
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


  const handleEditinformation = (informations) => {
    setForm({
      titre: informations.titre || "",
      description: informations.description || "",
      contenu: informations.contenu || "",
      image: informations.image || "",
      file: null,
    });
    setEditId(informations.id);
    setIsEditMode(true);
    setPopupOpen(true);
  };


  const handleDeleteinformation = async (inf) => {
    if (!window.confirm("Supprimer cette information ?")) return;
   
    const imagePath = inf.image;
    console.log(imagePath);
    try {
        if (imagePath) {
        const { error: deleteError } = await supabase.storage
            .from("images")
            .remove([imagePath]);

        if (deleteError) {
            console.error("Erreur suppression image :", deleteError.message);
        }
        }

        const { error: deleteDataError } = await supabase
        .from("informations")
        .delete()
        .eq("id", inf.id);

        if (deleteDataError) {
        console.error("Erreur suppression :", deleteDataError.message);
        alert("Erreur lors de la suppression de l'information.");
        } else {
        refresh();
        }
    } catch (error) {
        console.error("Erreur dans handleDeleteinformation :", error);
    }
    };
  

  return (
    <>
      <Typography variant="h4" gutterBottom color="green" align="center" sx={{ mt: 15 }}>
        Liste des informations
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
        Créer une information
        </Button>


      <TableContainer component={Paper} sx = {{marginBottom: 20}}>
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
            {informations.map((inf) => (
              <TableRow key={inf.id} >
                <TableCell>
                    {inf.image ? (
                        <img 
                        src={`https://brtumvrxurcpytdajejx.supabase.co/storage/v1/object/public/images/${inf.image}`} 
                        alt={inf.titre} 
                        style={{ maxWidth: "150px", maxHeight: "100px", objectFit: "contain" }}
                        />
                    ) : (
                        "Pas d'image"
                    )}
                </TableCell>
                <TableCell>{inf.titre}</TableCell>
                <TableCell>{inf.description}</TableCell>
                <TableCell>{inf.createur?.pseudo || "N/A"}</TableCell>
                <TableCell align="right">
                  <Button onClick={() => handleEditinformation(inf)} sx={{ minWidth: 0}}>
                    <EditIcon fontSize="small" />
                  </Button>
                  <Button onClick={() => handleDeleteinformation(inf)} sx={{ color: "red", minWidth: 0 }}>
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
            <DialogTitle sx={{textAlign: "center"}}>{isEditMode ? "Modifier l'information" : "Créer une information"}</DialogTitle>
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
                minRows={3}
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
            </DialogContent>
            <DialogActions>
            <Button onClick={handleClosePopup}>Annuler</Button>
            <Button onClick={handleSubmit} variant="contained" color={isEditMode ? "primary" : "success"}>
                {isEditMode ? "Modifier" : "Créer"}
            </Button>
            </DialogActions>
        </Dialog>
      </ThemeProvider>
    </>
  );
}
