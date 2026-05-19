import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase"; // Importando a ponte que criamos
import { Button, TextField, Alert, CircularProgress } from "@mui/material";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Função pura para lidar com o envio do formulário
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault(); 
    setError("");
    setLoading(true);

    try {
      // Chama o Firebase para autenticar
      await signInWithEmailAndPassword(auth, email, password);
      
      // Se deu certo, manda o usuário para dentro do SaaS
      navigate("/dashboard");
    } catch (err: any) {
      // Tratamento básico de erros do Firebase
      if (err.code === "auth/invalid-credential") {
        setError("E-mail ou senha incorretos.");
      } else {
        setError("Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Tailwind cuidando do layout: tela cheia, centralizado, fundo cinza claro
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      
      {/* Tailwind cuidando do "Card" branco */}
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">
          Broadcast
        </h2>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* Componentes do Material UI */}
          <TextField
            label="E-mail"
            type="email"
            variant="outlined"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <TextField
            label="Senha"
            type="password"
            variant="outlined"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            className="mt-2"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Entrar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Ainda não tem uma conta?{" "}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Crie sua conta aqui
          </Link>
        </p>
      </div>
    </div>
  );
}