import Layout from "@/components/Layout";
import { GerarConviteLink } from "@/components/GerarConviteLink";
import { ProfissionaisTab } from "@/components/profissionais/ProfissionaisTab";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Plus, Share2, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFichas,
  getServicos,
  createServico,
  atualizarServico,
  getTiposAcompanhamento,
  createTipoAcompanhamento,
  atualizarTipoAcompanhamento,
  excluirServico,
  excluirTipoAcompanhamento,
} from "@/lib/api";
import type { Servico, ServicoRequest, TipoAcompanhamento, TipoAcompanhamentoRequest } from "@/types/api";

const tabsBase = [
  { id: "fichas", label: "Ficha Pessoal (PIA)" },
  { id: "servicos", label: "Serviços" },
  { id: "tipos-acompanhamento", label: "Tipos de Acompanhamento" },
];

// Só entra para gerenciadores (DEV, ou PADRAO com a flag). Esconder é UX: a API devolve 403 de qualquer jeito.
const tabProfissionais = { id: "profissionais", label: "Profissionais" };

function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ErrorCard({ message }: { message?: string }) {
  return (
    <Card className="border-destructive/40">
      <CardContent className="p-4 text-sm text-destructive">
        Erro ao carregar dados: {message ?? "tente novamente."}
      </CardContent>
    </Card>
  );
}

const emptyServico: ServicoRequest = { nome: "" };
const emptyTipoAcompanhamento: TipoAcompanhamentoRequest = { nome: "" };

type ItemExclusao = { tipo: "servico" | "tipo-acompanhamento"; id: number; nome: string };

// Sem hover no celular: lá os botões ficam sempre visíveis.
const ACOES_CARD_CLASS =
  "absolute top-2 right-2 flex gap-1 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100 transition-opacity";

export default function Cadastros() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { auth } = useAuth();
  const tabs = auth?.podeGerenciarProfissionais ? [...tabsBase, tabProfissionais] : tabsBase;
  const tabPedida = searchParams.get("tab");
  const activeTab = tabs.some((t) => t.id === tabPedida) ? tabPedida : "fichas";
  const action = searchParams.get("action");
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [shareOpen, setShareOpen] = useState(false);

  const [servicoModalOpen, setServicoModalOpen] = useState(false);
  const [servicoEditando, setServicoEditando] = useState<Servico | null>(null);
  const [servicoForm, setServicoForm] = useState<ServicoRequest>(emptyServico);

  const [tipoModalOpen, setTipoModalOpen] = useState(false);
  const [tipoEditando, setTipoEditando] = useState<TipoAcompanhamento | null>(null);
  const [tipoForm, setTipoForm] = useState<TipoAcompanhamentoRequest>(emptyTipoAcompanhamento);

  const [exclusao, setExclusao] = useState<ItemExclusao | null>(null);

  useEffect(() => {
    if (action === "nova") setShareOpen(true);
  }, [action]);

  const fichasQuery = useQuery({
    queryKey: ["fichas", search],
    queryFn: () => getFichas({ q: search || undefined }),
    enabled: activeTab === "fichas",
  });

  const servicosQuery = useQuery({
    queryKey: ["servicos"],
    queryFn: getServicos,
    enabled: activeTab === "servicos",
  });

  const tiposAcompanhamentoQuery = useQuery({
    queryKey: ["tipos-acompanhamento"],
    queryFn: getTiposAcompanhamento,
    enabled: activeTab === "tipos-acompanhamento",
  });

  const criarServicoMutation = useMutation({
    mutationFn: (body: ServicoRequest) => createServico(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicos"] });
      fecharModalServico();
      toast.success("Serviço cadastrado com sucesso!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const editarServicoMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: ServicoRequest }) =>
      atualizarServico(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicos"] });
      fecharModalServico();
      toast.success("Serviço atualizado com sucesso!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const abrirModalNovo = () => {
    setServicoEditando(null);
    setServicoForm(emptyServico);
    setServicoModalOpen(true);
  };

  const abrirModalEditar = (s: Servico, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setServicoEditando(s);
    setServicoForm({ nome: s.nome });
    setServicoModalOpen(true);
  };

  const fecharModalServico = () => {
    setServicoModalOpen(false);
    setServicoEditando(null);
    setServicoForm(emptyServico);
  };

  const handleSalvarServico = () => {
    if (!servicoForm.nome.trim()) {
      toast.error("O nome do serviço é obrigatório.");
      return;
    }
    const body: ServicoRequest = {
      nome: servicoForm.nome.trim(),
    };
    if (servicoEditando) {
      editarServicoMutation.mutate({ id: servicoEditando.id, body });
    } else {
      criarServicoMutation.mutate(body);
    }
  };

  const isPendingServico = criarServicoMutation.isPending || editarServicoMutation.isPending;

  const criarTipoMutation = useMutation({
    mutationFn: (body: TipoAcompanhamentoRequest) => createTipoAcompanhamento(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tipos-acompanhamento"] });
      fecharModalTipo();
      toast.success("Tipo de acompanhamento cadastrado com sucesso!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const editarTipoMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: TipoAcompanhamentoRequest }) =>
      atualizarTipoAcompanhamento(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tipos-acompanhamento"] });
      fecharModalTipo();
      toast.success("Tipo de acompanhamento atualizado com sucesso!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const abrirModalTipoNovo = () => {
    setTipoEditando(null);
    setTipoForm(emptyTipoAcompanhamento);
    setTipoModalOpen(true);
  };

  const abrirModalTipoEditar = (t: TipoAcompanhamento, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTipoEditando(t);
    setTipoForm({ nome: t.nome });
    setTipoModalOpen(true);
  };

  const fecharModalTipo = () => {
    setTipoModalOpen(false);
    setTipoEditando(null);
    setTipoForm(emptyTipoAcompanhamento);
  };

  const handleSalvarTipo = () => {
    if (!tipoForm.nome.trim()) {
      toast.error("O nome do tipo de acompanhamento é obrigatório.");
      return;
    }
    const body: TipoAcompanhamentoRequest = { nome: tipoForm.nome.trim() };
    if (tipoEditando) {
      editarTipoMutation.mutate({ id: tipoEditando.id, body });
    } else {
      criarTipoMutation.mutate(body);
    }
  };

  const isPendingTipo = criarTipoMutation.isPending || editarTipoMutation.isPending;

  const excluirMutation = useMutation({
    mutationFn: (item: ItemExclusao) =>
      item.tipo === "servico" ? excluirServico(item.id) : excluirTipoAcompanhamento(item.id),
    onSuccess: (_, item) => {
      queryClient.invalidateQueries({ queryKey: [item.tipo === "servico" ? "servicos" : "tipos-acompanhamento"] });
      setExclusao(null);
      toast.success(item.tipo === "servico" ? "Serviço excluído." : "Tipo de acompanhamento excluído.");
    },
    // A lista pode estar velha (alguém usou o item depois que a tela carregou): recarrega para o botão refletir o uso.
    onError: (err: Error, item) => {
      queryClient.invalidateQueries({ queryKey: [item.tipo === "servico" ? "servicos" : "tipos-acompanhamento"] });
      setExclusao(null);
      toast.error(err.message);
    },
  });

  const pedirExclusao = (item: ItemExclusao, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExclusao(item);
  };

  const setTab = (tab: string) => {
    setSearchParams({ tab });
    setSearch("");
  };

  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground mb-6">Cadastros</h1>

        <div className="flex gap-1 mb-6 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "fichas" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar fichas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
              <Button onClick={() => setShareOpen(true)} className="bg-aziz-green hover:bg-aziz-green/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Nova Ficha
              </Button>
            </div>

            {fichasQuery.isLoading && <ListSkeleton />}
            {fichasQuery.isError && <ErrorCard message={(fichasQuery.error as Error)?.message} />}
            {!fichasQuery.isLoading && !fichasQuery.isError && (
              <div className="space-y-2">
                {(fichasQuery.data ?? []).map((f) => (
                  <Link key={f.id} to={`/acompanhamentos/${f.id}`}>
                    <Card className="hover:border-aziz-blue/30 transition-colors cursor-pointer">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{f.nome}</p>
                          <p className="text-sm text-muted-foreground">CPF: {f.cpf} · Ficha: {f.codigoFicha}</p>
                        </div>
                        <Badge
                          className={
                            f.status === "ATIVO"
                              ? "bg-aziz-green/10 text-aziz-green border-aziz-green/20"
                              : "bg-muted text-muted-foreground border-border"
                          }
                        >
                          {f.status === "ATIVO" ? "Ativo" : "Inativo"}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                {(fichasQuery.data ?? []).length === 0 && (
                  <p className="text-center text-muted-foreground py-12">Nenhuma ficha encontrada.</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "servicos" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Serviços disponíveis</h2>
              <Button onClick={abrirModalNovo} className="bg-aziz-green hover:bg-aziz-green/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Adicionar serviço
              </Button>
            </div>

            {servicosQuery.isLoading && <ListSkeleton rows={4} />}
            {servicosQuery.isError && <ErrorCard message={(servicosQuery.error as Error)?.message} />}
            {!servicosQuery.isLoading && !servicosQuery.isError && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(servicosQuery.data ?? []).map((s) => (
                  <Card key={s.id} className="hover:border-aziz-blue/30 transition-colors group relative">
                    <CardContent className="p-6 pt-10 md:pt-6 flex flex-col items-center text-center">
                      <span className="text-sm font-medium text-foreground">{s.nome}</span>
                      <div className={ACOES_CARD_CLASS}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={(e) => abrirModalEditar(s, e)}
                          title="Editar serviço"
                          aria-label={`Editar serviço ${s.nome}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={(e) => pedirExclusao({ tipo: "servico", id: s.id, nome: s.nome }, e)}
                          disabled={s.emUso}
                          title={s.emUso ? "Em uso em encaminhamentos ou profissionais: não pode ser excluído" : "Excluir serviço"}
                          aria-label={`Excluir serviço ${s.nome}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(servicosQuery.data ?? []).length === 0 && (
                  <p className="col-span-full text-center text-muted-foreground py-12">Nenhum serviço cadastrado.</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "tipos-acompanhamento" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Tipos de acompanhamento</h2>
              <Button onClick={abrirModalTipoNovo} className="bg-aziz-green hover:bg-aziz-green/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Adicionar tipo
              </Button>
            </div>

            {tiposAcompanhamentoQuery.isLoading && <ListSkeleton rows={4} />}
            {tiposAcompanhamentoQuery.isError && <ErrorCard message={(tiposAcompanhamentoQuery.error as Error)?.message} />}
            {!tiposAcompanhamentoQuery.isLoading && !tiposAcompanhamentoQuery.isError && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(tiposAcompanhamentoQuery.data ?? []).map((t) => (
                  <Card key={t.id} className="hover:border-aziz-blue/30 transition-colors group relative">
                    <CardContent className="p-6 pt-10 md:pt-6 flex flex-col items-center text-center">
                      <span className="text-sm font-medium text-foreground">{t.nome}</span>
                      <div className={ACOES_CARD_CLASS}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={(e) => abrirModalTipoEditar(t, e)}
                          title="Editar tipo de acompanhamento"
                          aria-label={`Editar tipo ${t.nome}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={(e) => pedirExclusao({ tipo: "tipo-acompanhamento", id: t.id, nome: t.nome }, e)}
                          disabled={t.emUso}
                          title={t.emUso ? "Atribuído a algum caso: não pode ser excluído" : "Excluir tipo de acompanhamento"}
                          aria-label={`Excluir tipo ${t.nome}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(tiposAcompanhamentoQuery.data ?? []).length === 0 && (
                  <p className="col-span-full text-center text-muted-foreground py-12">Nenhum tipo de acompanhamento cadastrado.</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "profissionais" && auth && <ProfissionaisTab perfil={auth} />}

        <Dialog open={shareOpen} onOpenChange={setShareOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Ficha PIA</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Escolha como deseja preencher a ficha:</p>
              <Link to="/cadastros/nova-ficha">
                <Button className="w-full bg-primary hover:bg-primary/90">Preencher internamente</Button>
              </Link>
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Share2 className="w-4 h-4" /> Compartilhar link para preenchimento
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Gera um link de uso único para a própria pessoa preencher os dados iniciais. O envio
                  cai na fila de fichas pendentes para revisão.
                </p>
                <GerarConviteLink />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={servicoModalOpen} onOpenChange={fecharModalServico}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>{servicoEditando ? "Editar serviço" : "Novo serviço"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="srv-nome" className="mb-1.5 block">Nome *</Label>
                <Input
                  id="srv-nome"
                  placeholder="Ex: Atendimento jurídico"
                  value={servicoForm.nome}
                  onChange={(e) => setServicoForm((f) => ({ ...f, nome: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={fecharModalServico}>Cancelar</Button>
              <Button
                className="bg-aziz-green hover:bg-aziz-green/90 text-primary-foreground"
                onClick={handleSalvarServico}
                disabled={isPendingServico}
              >
                {isPendingServico ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={tipoModalOpen} onOpenChange={fecharModalTipo}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>{tipoEditando ? "Editar tipo de acompanhamento" : "Novo tipo de acompanhamento"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tipo-nome" className="mb-1.5 block">Nome *</Label>
                <Input
                  id="tipo-nome"
                  placeholder="Ex: Acompanhamento psicológico"
                  value={tipoForm.nome}
                  onChange={(e) => setTipoForm((f) => ({ ...f, nome: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={fecharModalTipo}>Cancelar</Button>
              <Button
                className="bg-aziz-green hover:bg-aziz-green/90 text-primary-foreground"
                onClick={handleSalvarTipo}
                disabled={isPendingTipo}
              >
                {isPendingTipo ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={exclusao !== null} onOpenChange={(aberto) => !aberto && !excluirMutation.isPending && setExclusao(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>
                {exclusao?.tipo === "servico" ? "Excluir serviço" : "Excluir tipo de acompanhamento"}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Excluir <span className="font-medium text-foreground">{exclusao?.nome}</span>? Essa ação não pode ser
              desfeita.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExclusao(null)} disabled={excluirMutation.isPending}>
                Cancelar
              </Button>
              <Button
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => exclusao && excluirMutation.mutate(exclusao)}
                disabled={excluirMutation.isPending}
              >
                {excluirMutation.isPending ? "Excluindo..." : "Excluir"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}