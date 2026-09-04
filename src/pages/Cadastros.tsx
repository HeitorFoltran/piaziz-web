import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Plus, Filter, Share2, Copy, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFichas, getServicos, getProfissionais, createServico, atualizarServico } from "@/lib/api";
import type { Servico, ServicoRequest } from "@/types/api";

const tabs = [
  { id: "fichas", label: "Ficha Pessoal (PIA)" },
  { id: "servicos", label: "Serviços" },
  { id: "profissionais", label: "Profissionais" },
];

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

export default function Cadastros() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "fichas";
  const action = searchParams.get("action");
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [profServico, setProfServico] = useState("all");
  const [shareOpen, setShareOpen] = useState(false);
  const shareLink = `${window.location.origin}/ficha-publica/nova`;

  const [servicoModalOpen, setServicoModalOpen] = useState(false);
  const [servicoEditando, setServicoEditando] = useState<Servico | null>(null);
  const [servicoForm, setServicoForm] = useState<ServicoRequest>(emptyServico);

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

  const profissionaisQuery = useQuery({
    queryKey: ["profissionais", search, profServico],
    queryFn: () =>
      getProfissionais({
        q: search || undefined,
        servicoId: profServico === "all" ? undefined : profServico,
      }),
    enabled: activeTab === "profissionais",
  });

  const servicosFiltroQuery = useQuery({
    queryKey: ["servicos"],
    queryFn: getServicos,
    enabled: activeTab === "profissionais",
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

  const setTab = (tab: string) => {
    setSearchParams({ tab });
    setSearch("");
    setProfServico("all");
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
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <span className="text-sm font-medium text-foreground">{s.nome}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                        onClick={(e) => abrirModalEditar(s, e)}
                        title="Editar serviço"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
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

        {activeTab === "profissionais" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar profissionais..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
              <Select value={profServico} onValueChange={setProfServico}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {(servicosFiltroQuery.data ?? []).map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {profissionaisQuery.isLoading && <ListSkeleton />}
            {profissionaisQuery.isError && <ErrorCard message={(profissionaisQuery.error as Error)?.message} />}
            {!profissionaisQuery.isLoading && !profissionaisQuery.isError && (
              <div className="space-y-2">
                {(profissionaisQuery.data ?? []).map((p) => (
                  <Card key={p.id} className="hover:border-aziz-blue/30 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{p.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          CPF: {p.cpf}{p.carteiraProfissional ? ` · ${p.carteiraProfissional}` : ""}
                        </p>
                      </div>
                      {p.servicoNome && <Badge>{p.servicoNome}</Badge>}
                    </CardContent>
                  </Card>
                ))}
                {(profissionaisQuery.data ?? []).length === 0 && (
                  <p className="text-center text-muted-foreground py-12">Nenhum profissional encontrado.</p>
                )}
              </div>
            )}
          </div>
        )}

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
                <div className="flex gap-2">
                  <Input value={shareLink} readOnly className="text-xs" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => { navigator.clipboard.writeText(shareLink); toast.success("Link copiado!"); }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
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
      </div>
    </Layout>
  );
}