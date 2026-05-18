import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuth } from "../contexts/AuthContext";
import { AppBar, Toolbar, Typography, Button, Container, Box, Tabs, Tab } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import { ConexoesTab } from "../components/ConectionsTab";
import { ContatosTab } from "../components/ContactsTab";

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout", error);
    }
  };

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Broadcast SaaS
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }} className="hidden sm:block">
            {user?.email}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className="mt-8 pb-12">
        {/* Menu de Abas */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }} className="mb-6">
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Menu do SaaS">
            <Tab label="Conexões" />
            <Tab label="Contatos" />
          </Tabs>
        </Box>

        {/* Conteúdo Dinâmico */}
        <Box className="rounded-lg bg-white p-6 shadow-sm">
          {tabValue === 0 && <ConexoesTab />}
          {tabValue === 1 && <ContatosTab />}
        </Box>
      </Container>
    </div>
  );
}