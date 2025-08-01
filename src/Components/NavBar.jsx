import { useEffect, useState } from "react";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../BDD/SupaBaseClient";
import LogoutIcon from '@mui/icons-material/Logout';


export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        const { data, error: roleError } = await supabase
          .from("utilisateurs")
          .select("role")
          .eq("id", user.id)
          .single();

        if (data?.role === "admin") {
          setIsAdmin(true);
        }
      } else {
        setUser(null);
      }
    }

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    navigate("/connexion");
  };

  return (
    <AppBar position="fixed" sx={{ bgcolor: "green" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button component={Link} to="/" sx={{ color: "#fff" }}>
                Accueil
            </Button>

            <Button component={Link} to="/informations" sx={{ color: "#fff" }}>
                Informations
            </Button>

            {user && (
                <>
                <Button component={Link} to="/profil" sx={{ color: "#fff" }}>
                    Profil
                </Button>

                {isAdmin && (
                    <Button component={Link} to="/ADMIN_page" sx={{ color: "#fff" }}>
                    Gérer
                    </Button>
                )}
                </>
            )}

            {!user && (
                <Button component={Link} to="/connexion" sx={{ color: "#fff" }}>
                Connexion
                </Button>
            )}
            </Box>

            {user && (
            <Box>
                <Button onClick={handleLogout} sx={{ color: "white", minWidth: 0 }}>
                <LogoutIcon />
                </Button>
            </Box>
            )}
        </Toolbar>
    </AppBar>
  );
}
