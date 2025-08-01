import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Grid, Card, CardActionArea, CardMedia, CardContent, Box } from "@mui/material";
import supabase from "../../BDD/SupaBaseClient";




export default function InformationsPage() {
  const [information, setInformations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInformations = async () => {
      const { data, error } = await supabase
        .from("informations")
        .select("*")

      if (error) {
        console.error("Erreur chargement des informations :", error.message);
      } else {
        setInformations(data);
      }
    };

    fetchInformations();
  }, []);

  return (
    <Box px={4} py={6}>
      <Typography variant="h3" gutterBottom align="center" color="green" sx={{ mt: 5, marginBottom: 7}}>
        Informations
      </Typography>

      <Grid
        container
        spacing={4}
        justifyContent="center"
        columns={{ xs: 4, sm: 8, md: 12 }}
      >
        {information.map((inf) => (
          <Grid
            key={inf.id}
            size={{ xs: 4, sm: 4, md: 3 }}
            sx={{ display: "flex" }}
          >
            <Card
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                boxShadow: 4,
                borderRadius: 3,
                overflow: "hidden",
                transition: "transform 0.2s ease",
                "&:hover": {
                  transform: "scale(1.03)",
                  boxShadow: 6,
                },
              }}
            >
              <CardActionArea
                onClick={() => navigate("/information", {state: {inf}})}
                sx={{
                  height: 360,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                }}
              >
                <Box
                  sx={{
                    height: 200, 
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={`https://brtumvrxurcpytdajejx.supabase.co/storage/v1/object/public/images/${inf.image}`}
                    alt={inf.titre}
                    sx={{
                      maxHeight: "100%",
                      maxWidth: "100%",
                      objectFit: "contain",
                      mt: 5
                    }}
                  />
                </Box>

                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    align="center"
                    fontWeight="bold"
                  >
                    {inf.titre}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
