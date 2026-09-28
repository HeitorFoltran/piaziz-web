import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { RequireAuth } from "@/components/RequireAuth";
import Index from "./pages/Index.tsx";
import Acompanhamentos from "./pages/Acompanhamentos.tsx";
import AcompanhamentoDetalhe from "./pages/AcompanhamentoDetalhe.tsx";
import Cadastros from "./pages/Cadastros.tsx";
import NovaFicha from "./pages/NovaFicha.tsx";
import EditarFicha from "./pages/EditarFicha.tsx";
import Login from "./pages/Login.tsx";
import TrocarSenha from "./pages/TrocarSenha.tsx";
import Convites from "./pages/Convites.tsx";
import FichasPendentes from "./pages/FichasPendentes.tsx";
import FichaPublica from "./pages/FichaPublica.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
            {/* Relatórios fora da navegação desde o lote 6: as métricas vão ser reformuladas. */}
            <Route path="/relatorios" element={<RequireAuth><Navigate to="/" replace /></RequireAuth>} />
            <Route path="/acompanhamentos" element={<RequireAuth><Acompanhamentos /></RequireAuth>} />
            <Route path="/acompanhamentos/:id" element={<RequireAuth><AcompanhamentoDetalhe /></RequireAuth>} />
            <Route path="/acompanhamentos/:id/editar" element={<RequireAuth><EditarFicha /></RequireAuth>} />
            <Route path="/cadastros" element={<RequireAuth><Cadastros /></RequireAuth>} />
            <Route path="/cadastros/nova-ficha" element={<RequireAuth><NovaFicha /></RequireAuth>} />
            <Route path="/convites" element={<RequireAuth permiteEstagiario><Convites /></RequireAuth>} />
            <Route path="/fichas-pendentes" element={<RequireAuth><FichasPendentes /></RequireAuth>} />
            <Route path="/trocar-senha" element={<RequireAuth permiteEstagiario><TrocarSenha /></RequireAuth>} />
            <Route path="/login" element={<Login />} />
            <Route path="/ficha-publica/:token" element={<FichaPublica />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
