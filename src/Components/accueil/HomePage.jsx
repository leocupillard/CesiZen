import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {Typography, Grid, Card, CardActionArea, CardMedia, CardContent, Box,IconButton, FormControl, InputLabel, Select, MenuItem} from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import supabase from "../../BDD/SupaBaseClient";


export default function HomePage() {
  const [activites, setActivites] = useState([]);
  const [viewMode, setViewMode] = useState("tous");
  const [favoris, setFavorites] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const userId = user?.id;

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);



  useEffect(() => {
    const fetchActivites = async () => {
      const { data, error } = await supabase
        .from("activites")
        .select("*")
        .eq("visible", true);

      if (error) {
        console.error("Erreur chargement des activités :", error.message);
      } else {
        setActivites(data);
      }
    };

    fetchActivites();
  }, []);

 

  useEffect(() => {
    if (!user) return;

    const fetchFavoris = async () => {
      const { data, error } = await supabase
        .from("favoris")
        .select("id_activite")
        .eq("id_utilisateur", userId);

      if (error) {
        console.error("Erreur récupération favoris :", error.message);
      } else {
        const likedSet = new Set(data.map(fav => fav.id_activite));
        setLikedIds(likedSet);
      }
    };

    fetchFavoris();
  }, [user]);



  const toggleLike = async (id) => {
    if (!user) {
      alert("Vous devez être connecté pour aimer une activité.");
      return;
    }

    if (likedIds.has(id)) {
      const { error } = await supabase
        .from("favoris")
        .delete()
        .eq("id_utilisateur", user.id)
        .eq("id_activite", id);

      if (error) {
        console.error("Erreur suppression favori :", error.message);
      } else {
        setLikedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    } else {
      const { error } = await supabase.from("favoris").insert({
        id_utilisateur: user.id,
        id_activite: id,
      });

      if (error) {
        console.error("Erreur ajout favori :", error.message);
      } else {
        setLikedIds(prev => new Set(prev).add(id));
      }
    }
  };

  

  useEffect(() => {
    const fetchActFavorites = async () => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user) {
          setFavorites([]);
          return;
        }

        const { data, error } = await supabase
          .from("favoris")
          .select(`
            activites (
              id,
              titre,
              image,
              description,
              contenu,
              source
            )
          `)
          .eq("id_utilisateur", user.id);

        if (error) {
          console.error("Erreur chargement favoris :", error.message);
          setFavorites([]);
        } else {
          const likedActivities = data.map(fav => fav.activites);
          console.log("on est la : ", data)
          setFavorites(likedActivities);
        }
      };

      fetchActFavorites();
    }, []);


    let displayedActivities = [];
    if (viewMode === "favoris") {
      displayedActivities = [...favoris];
    } else if (viewMode === "asc" || viewMode === "desc") {
      displayedActivities = [...activites].sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return viewMode === "asc" ? dateA - dateB : dateB - dateA;
      });
    } else {
      displayedActivities = [...activites];
    }




  return (
    <Box px={4} py={6}>
      <Typography
        variant="h3"
        gutterBottom
        align="center"
        color="green"
        sx={{ mt: 5, marginBottom: 7 }}
      >
        Activités
      </Typography>


      <Box sx={{ mt: 5 }}>
      <FormControl sx={{ m: 1, minWidth: 280 }}>
        <InputLabel>Afficher</InputLabel>
        <Select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          label="Afficher"
        >
          <MenuItem value="tous">Toutes les activités</MenuItem>
          <MenuItem value="desc">Toutes les activités (récentes d'abord)</MenuItem>
          <MenuItem value="asc">Toutes les activités (anciennes d'abord)</MenuItem>
          <MenuItem value="favoris">Mes activités favorites</MenuItem>
        </Select>
      </FormControl>
      </Box>


      <Grid
        container
        spacing={4}
        justifyContent="center"
        columns={{ xs: 4, sm: 8, md: 12 }}
      >
        {displayedActivities.map((act) => (
          <Grid key={act.id} size={{ xs: 4, sm: 4, md: 3 }} sx={{ display: "flex", position: "relative" }}>
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
                position: "relative",
              }}
            >
              <CardActionArea
                onClick={() => navigate("/activite", { state: { act } })}
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
                  }}
                >
                  <CardMedia
                    component="img"
                    image={`https://brtumvrxurcpytdajejx.supabase.co/storage/v1/object/public/images/${act.image}`}
                    alt={act.titre}
                    sx={{
                      maxHeight: "100%",
                      maxWidth: "100%",
                      objectFit: "contain",
                      mt: 5,
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
                    position: "relative",
                  }}
                >
                  <Typography variant="h6" align="center" fontWeight="bold">
                    {act.titre}
                  </Typography>
                </CardContent>
              </CardActionArea>

              <IconButton
                aria-label="like"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(act.id);
                }}
                sx={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  color: likedIds.has(act.id) ? "red" : "black", 
                  backgroundColor: "transparent",
                  "&:hover": {
                    color: likedIds.has(act.id) ? "red" : "rgba(0, 0, 0, 0.7)", 
                    backgroundColor: "transparent",
                  },
                }}
              >
                {likedIds.has(act.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
