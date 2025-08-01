import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, CardMedia } from "@mui/material";

export default function InfoSelect() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const inf = state?.inf;

  if (!inf) {
    return (
      <Box p={4}>
        <Typography variant="h6" color="error">
          Aucune information sélectionnée.
        </Typography>
        <Button onClick={() => navigate("/")} sx={{ mt: 2 }}>
          Retour
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "1000px", mx: "auto", p: 10 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3 }}>
        <CardMedia
          component="img"
          image={`https://brtumvrxurcpytdajejx.supabase.co/storage/v1/object/public/images/${inf.image}`}
          alt={inf.titre}
          sx={{
            width: 250,
            height: "auto",
            borderRadius: 2,
          }}
        />

        <Box>
          <Typography variant="h1" gutterBottom>
            {inf.titre}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {inf.description}
          </Typography>
        </Box>
      </Box>

      <Box mt={4}>
        <div dangerouslySetInnerHTML={{ __html: inf.contenu }} />
      </Box>
    </Box>
  );
}
