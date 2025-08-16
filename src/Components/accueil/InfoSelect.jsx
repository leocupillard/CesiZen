import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, CardMedia, Button } from "@mui/material";

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
    <Box sx={{ maxWidth: "1000px", mx: "auto", p: { xs: 2, md: 10 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" }, 
          alignItems: "flex-start",
          gap: 3,
        }}
      >
        <CardMedia
          component="img"
          image={`https://brtumvrxurcpytdajejx.supabase.co/storage/v1/object/public/images/${inf.image}`}
          alt={inf.titre}
          sx={{
            width: { xs: "100%", md: 300 }, 
            height: "auto",
            borderRadius: 2,
          }}
        />

        <Box>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontSize: { xs: "1.8rem", md: "2.5rem" } }}
          >
            {inf.titre}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.9rem", md: "1.1rem" } }}
          >
            {inf.description}
          </Typography>
        </Box>
      </Box>

      <Box mt={4}>
        <div
          style={{ fontSize: "1rem", lineHeight: "1.6" }}
          dangerouslySetInnerHTML={{ __html: inf.contenu }}
        />
      </Box>
    </Box>
  );
}
