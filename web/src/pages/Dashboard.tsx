import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuth } from "../contexts/AuthContext";
import { AppBar, Toolbar, Typography, Button, Container, Box } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Extraindo o usuário logado do nosso Contexto!

  // Função pura para deslogar
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // O signOut do Firebase vai limpar a sessão. 
      // Nosso ProtectedRoute vai perceber e mandar o usuário pro /login automaticamente,
      // mas podemos forçar o navigate aqui também por garantia.
      navigate("/login");   
    } catch (error) {
      console.error("Erro ao fazer logout", error);
    }
  };

  return (
    // Tailwind cuidando do fundo da tela inteira
    <div className="min-h-screen bg-gray-100">
      
      {/* NavBar Superior com Material UI */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Broadcast SaaS
          </Typography>
          
          {/* Mostra o e-mail do usuário (esconde em telas muito pequenas com Tailwind) */}
          <Typography variant="body2" sx={{ mr: 2 }} className="hidden sm:block">
            {user?.email}
          </Typography>
          
          <Button 
            color="inherit" 
            onClick={handleLogout} 
            startIcon={<LogoutIcon />}
          >
            Sair
          </Button>
        </Toolbar>
      </AppBar>

      {/* Container Central para o conteúdo principal */}
      <Container maxWidth="lg" className="mt-8">
        <Box className="rounded-lg bg-white p-6 shadow-sm">
          <Typography variant="h4" className="mb-4 font-bold text-gray-800">
            Conexões
          </Typography>
          
          <Typography variant="body1" className="mb-6 text-gray-600">
            Bem-vindo! Este é o seu espaço isolado. Seu ID de cliente (clientId) para salvar no banco é:{" "}
            <span className="rounded bg-blue-50 p-1 font-mono text-sm text-blue-700">
              {user?.uid}
            </span>
          </Typography>

          {/* O componente de CRUD das conexões entrará aqui em breve */}
          <div className="flex h-32 items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50">
            <span className="text-gray-400">Área reservada para a Lista de Conexões</span>
          </div>

        </Box>
      </Container>
    </div>
  );
}