import Layout from "@/components/Layout";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Send, ChevronDown, ChevronUp } from "lucide-react";
import { CheckboxOptionList } from "@/components/ficha/CheckboxOptionList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFicha, createInteracao, createEncaminhamento, atualizarStatusFicha, getServicos, atribuirTiposAcompanhamento, getTiposAcompanhamento } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { STATUS_LABEL, STATUS_BADGE_CLASS, type StatusFicha } from "@/lib/status";
import { toast } from "sonner";
import type { EncaminhamentoRequest } from "@/types/api";

const tipoMoradiaLabel: Record<string, string> = {
  CASA_PROPRIA: "Casa própria",
  ALUGADA: "Alugada",
  CEDIDA: "Cedida",
  ABRIGO: "Abrigo",
  OUTRO: "Outro",
};

const emptyEncaminhamento: EncaminhamentoRequest = {
  servicoId: 0,
  categoria: undefined,
  profissional: "",
  dataEncaminhamento: "",
  dataRetorno: "",
  descricao: "",
};

const categoriaEncaminhamentoLabel: Record<string, string> = {
  SAUDE_GERAL: "Serviços de saúde em geral",
  SAUDE_MENTAL: "Serviço de saúde mental",
  HABITACAO: "Habitação",
  TRABALHO_EMPREGO: "Trabalho/emprego",
  ASSISTENCIA_SOCIAL: "Assistência social (CRAS/CREAS)",
  ASSISTENCIA_EDUCACIONAL: "Assistência educacional",
  OUTRO: "Outro",
};

export default function AcompanhamentoDetalhe() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [novoComentario, setNovoComentario] = useState("");
  const [encModalOpen, setEncModalOpen] = useState(false);
  const [encForm, setEncForm] = useState<EncaminhamentoRequest>(emptyEncaminhamento);
  const [fichaExpandida, setFichaExpandida] = useState(false);
  const [tiposModalOpen, setTiposModalOpen] = useState(false);
  const [tiposSelecionados, setTiposSelecionados] = useState<string[]>([]);

  const { data: ficha, isLoading, isError, error } = useQuery({
    queryKey: ["ficha", id],
    queryFn: () => getFicha(id!),
    enabled: !!id,
  });

  const { data: servicos = [] } = useQuery({
    queryKey: ["servicos"],
    queryFn: getServicos,
    enabled: encModalOpen,
  });

  const { data: catalogoTipos = [] } = useQuery({
    queryKey: ["tipos-acompanhamento"],
    queryFn: getTiposAcompanhamento,
    enabled: tiposModalOpen,
  });

  const interacaoMutation = useMutation({
    mutationFn: (texto: string) => createInteracao(id!, { autor: "Usuário", texto }),
    onSuccess: () => {
      setNovoComentario("");
      queryClient.invalidateQueries({ queryKey: ["ficha", id] });
      toast.success("Comentário enviado!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const encaminhamentoMutation = useMutation({
    mutationFn: (body: EncaminhamentoRequest) => createEncaminhamento(id!, body),
    onSuccess: () => {
      setEncModalOpen(false);
      setEncForm(emptyEncaminhamento);
      queryClient.invalidateQueries({ queryKey: ["ficha", id] });
      toast.success("Encaminhamento criado!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const statusMutation = useMutation({
    mutationFn: (novoStatus: StatusFicha) => atualizarStatusFicha(id!, novoStatus),
    onSuccess: (fichaAtualizada) => {
      queryClient.invalidateQueries({ queryKey: ["ficha", id] });
      queryClient.invalidateQueries({ queryKey: ["acompanhamentos"] });
      toast.success(`Status alterado para ${STATUS_LABEL[fichaAtualizada.status as StatusFicha]}.`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const tiposMutation = useMutation({
    mutationFn: (tipoIds: number[]) => atribuirTiposAcompanhamento(id!, tipoIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ficha", id] });
      queryClient.invalidateQueries({ queryKey: ["acompanhamentos"] });
      setTiposModalOpen(false);
      toast.success("Tipos de acompanhamento atualizados!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const abrirModalTipos = () => {
    setTiposSelecionados((ficha?.tiposAcompanhamento ?? []).map((t) => String(t.id)));
    setTiposModalOpen(true);
  };

  const handleSalvarTipos = () => {
    tiposMutation.mutate(tiposSelecionados.map(Number));
  };

  const handleEnviarComentario = () => {
    const texto = novoComentario.trim();
    if (!texto) return;
    interacaoMutation.mutate(texto);
  };

  const handleCriarEncaminhamento = () => {
    if (!encForm.servicoId) {
      toast.error("Selecione o serviço de encaminhamento.");
      return;
    }
    const body: EncaminhamentoRequest = {
      servicoId: encForm.servicoId,
      categoria: encForm.categoria || undefined,
      profissional: encForm.profissional || undefined,
      dataEncaminhamento: encForm.dataEncaminhamento || undefined,
      dataRetorno: encForm.dataRetorno || undefined,
      descricao: encForm.descricao || undefined,
    };
    encaminhamentoMutation.mutate(body);
  };

  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <Link to="/acompanhamentos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar para acompanhamentos
        </Link>

        {isError && (
          <Card className="border-destructive/40 mb-6">
            <CardContent className="p-4 text-sm text-destructive">
              Erro ao carregar a ficha: {(error as Error)?.message ?? "tente novamente."}
            </CardContent>
          </Card>
        )}

        <Card className="mb-4">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-muted-foreground block text-xs">Código Ficha</span><span className="font-medium">{ficha?.codigoFicha ?? "-"}</span></div>
                <div><span className="text-muted-foreground block text-xs">Nome</span><span className="font-medium">{ficha?.nome ?? "-"}</span></div>
                <div><span className="text-muted-foreground block text-xs">Documento</span><span className="font-medium">{ficha?.cpf ?? "-"}</span></div>
                <div className="flex flex-col gap-2">
                  <span className="text-muted-foreground block text-xs">Status</span>
                  <div className="flex items-center gap-2">
                    <Select
                      value={ficha?.status}
                      onValueChange={(v) => statusMutation.mutate(v as StatusFicha)}
                      disabled={statusMutation.isPending}
                    >
                      <SelectTrigger className={`h-7 w-[130px] text-xs ${ficha ? STATUS_BADGE_CLASS[ficha.status as StatusFicha] : ""}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(STATUS_LABEL) as StatusFicha[]).map((s) => (
                          <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Link to={`/acompanhamentos/${id}/editar`}>
    <Button size="sm" variant="outline" className="h-6 text-xs px-2">
      Editar ficha
    </Button>
  </Link>
                  </div>
                </div>
                <div><span className="text-muted-foreground block text-xs">Nº Caso</span><span className="font-medium">{ficha?.numeroCaso ?? "-"}</span></div>
                <div><span className="text-muted-foreground block text-xs">Data Criação</span><span className="font-medium">{formatDate(ficha?.dataCriacao)}</span></div>
                <div><span className="text-muted-foreground block text-xs">Última Atualização</span><span className="font-medium">{formatDate(ficha?.dataAtualizacao)}</span></div>
                <div className="flex flex-col gap-2">
                  <span className="text-muted-foreground block text-xs">Tipos de Acompanhamento</span>
                  <div className="flex flex-wrap items-center gap-1">
                    {(ficha?.tiposAcompanhamento ?? []).map((t) => (
                      <Badge key={t.id} className="bg-aziz-blue/10 text-aziz-blue border-aziz-blue/20">
                        {t.nome}
                      </Badge>
                    ))}
                    <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={abrirModalTipos}>
                      Gerenciar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!isLoading && ficha && (
          <Card className="mb-6">
            <CardHeader className="cursor-pointer select-none p-4" onClick={() => setFichaExpandida((v) => !v)}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-aziz-blue">Dados do PIA preenchidos</CardTitle>
                {fichaExpandida ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </CardHeader>
            {fichaExpandida && (
              <CardContent className="p-4 pt-0 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-muted-foreground block text-xs">Telefone</span><span className="font-medium">{ficha.telefone ?? "-"}</span></div>
                <div><span className="text-muted-foreground block text-xs">Idade</span><span className="font-medium">{ficha.idade ?? "-"}</span></div>
                <div><span className="text-muted-foreground block text-xs">Estado Civil</span><span className="font-medium">{ficha.estadoCivil ?? "-"}</span></div>
                <div><span className="text-muted-foreground block text-xs">Pessoas Dependentes</span><span className="font-medium">{ficha.pessoasDependentes ?? "-"}</span></div>
                <div><span className="text-muted-foreground block text-xs">Idade dos Filhos</span><span className="font-medium">{ficha.idadeFilhos ?? "-"}</span></div>
                <div><span className="text-muted-foreground block text-xs">Qtd. Filhos</span><span className="font-medium">{ficha.qtdFilhos ?? "-"}</span></div>
                <div><span className="text-muted-foreground block text-xs">Nível de Segurança</span><span className="font-medium">{ficha.nivelSeguranca != null ? `${ficha.nivelSeguranca} / 5` : "-"}</span></div>
                <div><span className="text-muted-foreground block text-xs">Tipo de Moradia</span><span className="font-medium">{ficha.tipoMoradia ? (tipoMoradiaLabel[ficha.tipoMoradia] ?? ficha.tipoMoradia) : "-"}</span></div>
                <div><span className="text-muted-foreground block text-xs">Qtd. Moradores</span><span className="font-medium">{ficha.qtdMoradores ?? "-"}</span></div>
              </CardContent>
            )}
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Timeline de Encaminhamentos</h2>
              <Button
                size="sm"
                className="bg-aziz-green hover:bg-aziz-green/90 text-primary-foreground"
                onClick={() => setEncModalOpen(true)}
                disabled={ficha?.status === "ENCERRADO"}
                title={ficha?.status === "ENCERRADO" ? "Reative o acompanhamento para novos encaminhamentos" : undefined}
              >
                <Plus className="w-4 h-4 mr-1" /> Novo Encaminhamento
              </Button>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-4">
                {isLoading && Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="relative pl-10"><Skeleton className="h-24 w-full" /></div>
                ))}

                {!isLoading && (ficha?.encaminhamentos ?? []).map((item) => (
                  <div key={item.id} className="relative pl-10">
                    <div className="absolute left-2.5 top-4 w-3 h-3 rounded-full bg-aziz-blue border-2 border-card" />
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Badge className="bg-aziz-blue/10 text-aziz-blue border-aziz-blue/20 mb-1">
                              {item.servicoNome ?? "-"}
                            </Badge>
                            {item.categoria && (
                              <Badge className="ml-1 mb-1">
                                {categoriaEncaminhamentoLabel[item.categoria] ?? item.categoria}
                              </Badge>
                            )}
                            <p className="text-sm font-medium text-foreground">{item.profissional}</p>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <p>Encaminhado: {formatDate(item.dataEncaminhamento)}</p>
                            <p>Retorno: {formatDate(item.dataRetorno)}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.descricao}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}

                {!isLoading && (ficha?.encaminhamentos ?? []).length === 0 && (
                  <p className="pl-10 text-sm text-muted-foreground">Nenhum encaminhamento registrado.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Interações</h2>
            <div className="space-y-3">
              {isLoading && Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              {!isLoading && (ficha?.interacoes ?? []).map((int) => (
                <Card key={int.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-aziz-blue">{int.autor}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(int.dataInteracao)}</span>
                    </div>
                    <p className="text-sm text-foreground">{int.texto}</p>
                  </CardContent>
                </Card>
              ))}
              {!isLoading && (ficha?.interacoes ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma interação ainda.</p>
              )}
            </div>
            <Card>
              <CardContent className="p-3">
                <Textarea
                  placeholder="Adicionar comentário..."
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  className="mb-2 min-h-[80px]"
                />
                <div className="flex justify-end">
                  <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handleEnviarComentario} disabled={interacaoMutation.isPending || !novoComentario.trim()}>
                    <Send className="w-4 h-4 mr-1" /> {interacaoMutation.isPending ? "Enviando..." : "Enviar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={encModalOpen} onOpenChange={setEncModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Encaminhamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="enc-servico" className="mb-1.5 block">Serviço *</Label>
              <Select
                value={encForm.servicoId ? String(encForm.servicoId) : ""}
                onValueChange={(v) => setEncForm((f) => ({ ...f, servicoId: Number(v) }))}
              >
                <SelectTrigger id="enc-servico">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {servicos.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="enc-categoria" className="mb-1.5 block">Categoria</Label>
              <Select
                value={encForm.categoria ?? ""}
                onValueChange={(v) => setEncForm((f) => ({ ...f, categoria: v as EncaminhamentoRequest["categoria"] }))}
              >
                <SelectTrigger id="enc-categoria">
                  <SelectValue placeholder="Selecione a categoria (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoriaEncaminhamentoLabel).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="enc-prof" className="mb-1.5 block">Profissional</Label>
              <Input
                id="enc-prof"
                value={encForm.profissional ?? ""}
                onChange={(e) => setEncForm((f) => ({ ...f, profissional: e.target.value }))}
                placeholder="Nome do profissional"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="enc-data" className="mb-1.5 block">Data encaminhamento</Label>
                <Input id="enc-data" type="date" value={encForm.dataEncaminhamento ?? ""} onChange={(e) => setEncForm((f) => ({ ...f, dataEncaminhamento: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="enc-retorno" className="mb-1.5 block">Data retorno</Label>
                <Input id="enc-retorno" type="date" value={encForm.dataRetorno ?? ""} onChange={(e) => setEncForm((f) => ({ ...f, dataRetorno: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label htmlFor="enc-desc" className="mb-1.5 block">Descrição</Label>
              <Textarea
                id="enc-desc"
                value={encForm.descricao ?? ""}
                onChange={(e) => setEncForm((f) => ({ ...f, descricao: e.target.value }))}
                placeholder="Descreva o encaminhamento..."
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEncModalOpen(false)}>Cancelar</Button>
            <Button className="bg-aziz-green hover:bg-aziz-green/90 text-primary-foreground" onClick={handleCriarEncaminhamento} disabled={encaminhamentoMutation.isPending}>
              {encaminhamentoMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tiposModalOpen} onOpenChange={setTiposModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Tipos de Acompanhamento</DialogTitle>
          </DialogHeader>
          {catalogoTipos.length > 0 ? (
            <CheckboxOptionList
              idPrefix="tipo-acomp"
              options={catalogoTipos.map((t) => ({ v: String(t.id), l: t.nome }))}
              value={tiposSelecionados}
              onValueChange={setTiposSelecionados}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum tipo cadastrado — cadastre em Cadastros &gt; Tipos de Acompanhamento.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTiposModalOpen(false)}>Cancelar</Button>
            <Button
              className="bg-aziz-green hover:bg-aziz-green/90 text-primary-foreground"
              onClick={handleSalvarTipos}
              disabled={tiposMutation.isPending}
            >
              {tiposMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
