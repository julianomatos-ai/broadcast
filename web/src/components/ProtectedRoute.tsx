import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { CircularProgress } from "@mui/material";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  // Enquanto o Firebase verifica o login, mostramos um loading centralizado
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <CircularProgress />
      </div>
    );
  }

  // Se a verificação terminou e não tem usuário, chuta pro login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se está tudo certo, permite renderizar a tela (children)
  return children;
}