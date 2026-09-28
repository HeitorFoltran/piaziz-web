import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, History, KeyRound, Pencil, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { HistoricoContaDialog } from "@/components/profissionais/HistoricoContaDialog";
import { ProfissionalDialog } from "@/components/profissionais/ProfissionalDialog";
import { ResetarSenhaDialog } from "@/components/profissionais/ResetarSenhaDialog";
import type { Perfil } from "@/contexts/AuthContext";
import { getProfissionais, getServicos, mensagemDeErro } from "@/lib/api";
import { ROLE_LABEL } from "@/lib/conta";
import type { Profissional } from "@/types/api";

// Só é renderizada para gerenciadores (Cadastros.tsx). Esconder a aba não protege nada:
// quem protege é o 403 da API em /api/profissionais.
export function ProfissionaisTab({ perfil }: { perfil: Perfil }) {
  const [search, setSearch] = useState("");
  const [servicoFiltro, setServicoFiltro] = useState("all");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [resetando, setResetando] = useState<Profissional | null>(null);
  const [vendoHistorico, setVendoHistorico] = useState<Profissional | null>(null);

  const profissionaisQuery = useQuery({
    queryKey: ["profissionais", search, servicoFiltro],
    queryFn: () =>
      getProfissionais({
        q: search || undefined,
        servicoId: servicoFiltro === "all" ? undefined : servicoFiltro,
      }),
  });

  const servicosQuery = useQuery({ queryKey: ["servicos"], queryFn: getServicos });
  const servicos = servicosQuery.data ?? [];

  // Conta DEV e conta de gerenciador: só o DEV edita, desativa ou reseta (a API responde 403).
  // A própria linha continua editável, com papel/ativo/flag travados no dialog.
  const souDev = perfil.role === "DEV";
  const contaProtegida = (p: Profissional) => p.role === "DEV" || p.podeGerenciarProfissionais;
  const podeEditar = (p: Profissional) => p.id === perfil.id || souDev || !contaProtegida(p);
  const podeResetar = (p: Profissional) => p.id !== perfil.id && (souDev || !contaProtegida(p));

  const abrirNovo = () => {
    setEditandoId(null);
    setDialogAberto(true);
  };

  const abrirEdicao = (id: number) => {
    setEditandoId(id);
    setDialogAberto(true);
  };

  const fecharDialog = () => {
    setDialogAberto(false);
    setEditandoId(null);
  };

  const lista = profissionaisQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, usuário ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={servicoFiltro} onValueChange={setServicoFiltro}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {servicos.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={abrirNovo} className="bg-aziz-green hover:bg-aziz-green/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Novo profissional
        </Button>
      </div>

      {profissionaisQuery.isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {profissionaisQuery.isError && (
        <Card className="border-destructive/40">
          <CardContent className="p-4 text-sm text-destructive">
            Erro ao carregar dados: {mensagemDeErro(profissionaisQuery.error)}
          </CardContent>
        </Card>
      )}
      {!profissionaisQuery.isLoading && !profissionaisQuery.isError && (
        <div className="space-y-2">
          {lista.map((p) => (
            <Card key={p.id} className={p.ativo ? "" : "opacity-70"}>
              <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{p.nome}</p>
                    {!p.ativo && <Badge className="bg-muted text-muted-foreground border-border">Inativa</Badge>}
                    {p.podeGerenciarProfissionais && (
                      <Badge className="bg-aziz-blue/10 text-aziz-blue border-aziz-blue/20">Gerencia profissionais</Badge>
                    )}
                    {p.deveTrocarSenha && (
                      <Badge className="bg-aziz-yellow/20 text-aziz-navy border-aziz-yellow/40">Senha provisória pendente</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    @{p.username} · {p.email ?? "-"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    CPF: {p.cpf} · {ROLE_LABEL[p.role] ?? p.role}
                    {p.servicoNome ? ` · ${p.servicoNome}` : ""}
                    {p.carteiraProfissional ? ` · ${p.carteiraProfissional}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {podeEditar(p) && (
                    <Button size="sm" variant="outline" onClick={() => abrirEdicao(p.id)} aria-label={`Editar ${p.nome}`}>
                      <Pencil className="w-3.5 h-3.5 mr-1.5" /> Editar
                    </Button>
                  )}
                  {podeResetar(p) && (
                    <Button size="sm" variant="outline" onClick={() => setResetando(p)} aria-label={`Resetar senha de ${p.nome}`}>
                      <KeyRound className="w-3.5 h-3.5 mr-1.5" /> Resetar senha
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setVendoHistorico(p)} aria-label={`Histórico de ${p.nome}`}>
                    <History className="w-3.5 h-3.5 mr-1.5" /> Histórico
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {lista.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Nenhum profissional encontrado.</p>
          )}
        </div>
      )}

      <ProfissionalDialog
        open={dialogAberto}
        editandoId={editandoId}
        perfil={perfil}
        servicos={servicos}
        onClose={fecharDialog}
      />
      <ResetarSenhaDialog profissional={resetando} onClose={() => setResetando(null)} />
      <HistoricoContaDialog profissional={vendoHistorico} onClose={() => setVendoHistorico(null)} />
    </div>
  );
}
