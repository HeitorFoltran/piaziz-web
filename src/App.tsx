import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import Acompanhamentos from "./pages/Acompanhamentos.tsx";
import AcompanhamentoDetalhe from "./pages/AcompanhamentoDetalhe.tsx";
import Cadastros from "./pages/Cadastros.tsx";
import NovaFicha from "./pages/NovaFicha.tsx";
import EditarFicha from "./pages/EditarFicha.tsx";
import Login from "./pages/Login.tsx";
import EmBreve from "./pages/EmBreve.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: ReactNode }) {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (auth.role === "ESTAGIARIO") return <Navigate to="/em-breve" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
            <Route path="/acompanhamentos" element={<RequireAuth><Acompanhamentos /></RequireAuth>} />
            <Route path="/acompanhamentos/:id" element={<RequireAuth><AcompanhamentoDetalhe /></RequireAuth>} />
            <Route path="/acompanhamentos/:id/editar" element={<RequireAuth><EditarFicha /></RequireAuth>} />
            <Route path="/cadastros" element={<RequireAuth><Cadastros /></RequireAuth>} />
            <Route path="/cadastros/nova-ficha" element={<RequireAuth><NovaFicha /></RequireAuth>} />
            <Route path="/login" element={<Login />} />
            <Route path="/em-breve" element={<EmBreve />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
