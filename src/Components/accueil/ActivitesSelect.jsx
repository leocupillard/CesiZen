import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, CardMedia } from "@mui/material";

export default function ActivitesSelect() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const act = state?.act;

  if (!act) {
    return (
      <Box p={4}>
        <Typography variant="h6" color="error">
          Aucune activité sélectionnée.
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
          image={`https://brtumvrxurcpytdajejx.supabase.co/storage/v1/object/public/images/${act.image}`}
          alt={act.titre}
          sx={{
            width: 400,
            height: "auto",
            borderRadius: 2,
          }}
        />

        <Box>
          <Typography variant="h1" gutterBottom>
            {act.titre}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {act.description}
          </Typography>
        </Box>
      </Box>


      <Box mt={4}>
        <div dangerouslySetInnerHTML={{ __html: act.contenu }} />
      </Box>


      <Box mt={6} display="flex" justifyContent="center">
        <Typography variant="caption" textAlign="center">
            Source :{' '}
            <a href={act.source} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
            {act.source}
            </a>
        </Typography>
        </Box>
    </Box>
  );
}
