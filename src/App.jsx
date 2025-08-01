import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ConnexionPage from "./Components/utilisateur/ConnexionPage";
import InscriptionPage from "./Components/utilisateur/InscriptionPage";
import HomePage from "./Components/accueil/HomePage";
import ActivitesSelect from "./Components/accueil/ActivitesSelect";
import InformationsPage from "./Components/accueil/InformationsPage";
import InfoSelect from "./Components/accueil/InfoSelect";
import ProfilPage from "./Components/utilisateur/ProfilPage";
import Navbar from "./Components/NavBar";
import AdminPage from "./Components/admin/AdminPage";
import CreateUserByAdmin from "./Components/admin/CreateUserByAdmin";
import supabase from "./BDD/SupaBaseClient";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(null);
  const [userChecked, setUserChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  const hideNavbarRoutes = ["/connexion", "/inscription"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname.toLowerCase());

  useEffect(() => {
  const checkAuthAndRole = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user || error) {
      setIsAdmin(false);
      setIsLoggedIn(false);

      const protectedRoutes = ["/admin_page", "/createuserbyadmin", "/profil"];
      if (protectedRoutes.includes(location.pathname.toLowerCase())) {
        navigate("/connexion");
        return;
      }

      setUserChecked(true);
      return;
    }

    setIsLoggedIn(true);

    if (["/connexion", "/inscription"].includes(location.pathname.toLowerCase())) {
      navigate("/");
      return;
    }

    if (["/admin_page", "/createuserbyadmin"].includes(location.pathname.toLowerCase())) {
      const { data: userData, error: roleError } = await supabase
        .from("utilisateurs")
        .select("role")
        .eq("id", user.id)
        .single();

      if (roleError || !userData || userData.role !== "admin") {
        setIsAdmin(false);
        navigate("/"); 
        return;
      }

      setIsAdmin(true);
    }

    setUserChecked(true);
  };

  checkAuthAndRole();
}, [location.pathname, navigate]);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}

      <Routes>
        <Route path="/connexion" element={<ConnexionPage />} />
        <Route path="/inscription" element={<InscriptionPage />} />
        <Route path="/profil" element={<ProfilPage />} />
        <Route path="/admin_page" element={<AdminPage />} />
        <Route path="/createuserbyadmin" element={<CreateUserByAdmin />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/activite" element={<ActivitesSelect />} />
        <Route path="/informations" element={<InformationsPage />} />
        <Route path="/information" element={<InfoSelect />} />
      </Routes>
    </>
  );
}
