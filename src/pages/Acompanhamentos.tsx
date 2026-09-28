import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TiposAcompanhamentoTags } from "@/components/ficha/TiposAcompanhamentoTags";
import { FiltrosAcompanhamentos } from "@/components/acompanhamentos/FiltrosAcompanhamentos";
import { PaginacaoAcompanhamentos } from "@/components/acompanhamentos/PaginacaoAcompanhamentos";
import { Skeleton } from "@/components/ui/skeleton";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAcompanhamentos, getServicos, getTiposAcompanhamento } from "@/lib/api";
import { formatDate } from "@/lib/format";
import {
  FILTROS_PADRAO,
  contarFiltrosAtivos,
  lerFiltros,
  lerPagina,
  paramsDosFiltros,
  type FiltrosAcompanhamentos as Filtros,
} from "@/lib/filtros-acompanhamentos";
import { STATUS_LABEL, STATUS_BADGE_CLASS, type StatusFicha } from "@/lib/status";

export default function Acompanhamentos() {
  // Os filtros moram na URL: abrir um caso e voltar mantém a lista como estava.
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const filtros = lerFiltros(searchParams);
  const pagina = lerPagina(searchParams);
  // O campo de busca tem estado próprio e só vai para a URL (e para a API) depois do debounce.
  const [search, setSearch] = useState(q);
  const [painelAberto, setPainelAberto] = useState(false);

  // replace: o "voltar" do navegador não passa por cada mudança de filtro.
  // Mudar filtro ou busca volta para a página 1: paramsDosFiltros sem página.
  const atualizarUrl = (novoQ: string, novosFiltros: Filtros) =>
    setSearchParams(paramsDosFiltros(novoQ, novosFiltros), { replace: true });
  const mudarFiltros = (mudanca: Partial<Filtros>) => atualizarUrl(q, { ...filtros, ...mudanca });
  const limparFiltros = () => atualizarUrl(q, FILTROS_PADRAO);
  // Troca de página é push: o "voltar" do navegador volta uma página da lista.
  const irParaPagina = (nova: number) => {
    setSearchParams(paramsDosFiltros(q, filtros, nova));
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    const busca = search.trim();
    if (busca === q) return;
    const t = setTimeout(() => setSearchParams((atual) => paramsDosFiltros(busca, lerFiltros(atual)), { replace: true }), 350);
    return () => clearTimeout(t);
  }, [search, q, setSearchParams]);

  // Todos os filtros rodam na API, que devolve uma página. Nada é filtrado aqui: filtrar só a página
  // recebida deixaria a contagem e a navegação entre páginas erradas.
  // Datas invertidas: o aviso aparece no FiltrosAcompanhamentos e o intervalo não vai para a API.
  const { de, ate, campoData } = filtros;
  const intervaloInvalido = de !== "" && ate !== "" && de > ate;

  const { data, isLoading, isError, error, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["acompanhamentos", q, filtros, pagina],
    queryFn: () =>
      getAcompanhamentos({
        q: q || undefined,
        servicoId: filtros.servico === "all" ? undefined : filtros.servico,
        status: filtros.status === "all" ? undefined : filtros.status,
        tipoId: filtros.tipo === "all" ? undefined : filtros.tipo,
        meus: filtros.meus || undefined,
        campoData,
        de: intervaloInvalido ? undefined : de || undefined,
        ate: intervaloInvalido ? undefined : ate || undefined,
        page: pagina - 1,
      }),
    // Troca de filtro ou de página não volta para o skeleton: a lista anterior fica, esmaecida, até a nova chegar.
    placeholderData: keepPreviousData,
  });

  const { data: servicos = [] } = useQuery({
    queryKey: ["servicos"],
    queryFn: getServicos,
  });

  const { data: tipos = [] } = useQuery({
    queryKey: ["tipos-acompanhamento"],
    queryFn: getTiposAcompanhamento,
  });

  const items = data?.itens ?? [];
  const totalItens = data?.totalItens ?? 0;
  const totalPaginas = data?.totalPaginas ?? 0;
  const atualizando = isFetching && isPlaceholderData;

  // Página além do fim (link antigo, ou o último caso da página saiu do filtro): a API devolve itens
  // vazio com o total certo, e a URL vai para a última página em vez de mostrar "nenhum encontrado".
  const alemDoFim = !!data && !isPlaceholderData && items.length === 0 && totalPaginas > 0 && pagina > totalPaginas;
  useEffect(() => {
    if (!alemDoFim) return;
    setSearchParams(
      (atual) => paramsDosFiltros(atual.get("q") ?? "", lerFiltros(atual), totalPaginas),
      { replace: true },
    );
  }, [alemDoFim, totalPaginas, setSearchParams]);

  const filtrosAtivos = contarFiltrosAtivos(filtros);
  const carregado = !isLoading && !isError;
  const contagem = `${totalItens} ${totalItens === 1 ? "acompanhamento" : "acompanhamentos"}`;

  const botaoLimpar = filtrosAtivos > 0 && (
    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={limparFiltros}>
      Limpar
    </Button>
  );

  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground mb-6">Acompanhamentos</h1>

        <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-6">
          {/* Abaixo de lg a coluna some e os mesmos filtros abrem no painel lateral. top-20: abaixo do header (h-16). */}
          <aside className="hidden lg:block lg:sticky lg:top-20">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex h-7 items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">Filtros</h2>
                  {botaoLimpar}
                </div>
                <FiltrosAcompanhamentos filtros={filtros} onChange={mudarFiltros} servicos={servicos} tipos={tipos} />
              </CardContent>
            </Card>
          </aside>

          <div className="min-w-0 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, nº caso, ficha ou CPF..."
                  aria-label="Buscar"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="lg:hidden shrink-0" onClick={() => setPainelAberto(true)}>
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtros{filtrosAtivos > 0 && ` (${filtrosAtivos})`}
              </Button>
              {carregado && <p className="hidden lg:block shrink-0 text-sm text-muted-foreground">{contagem}</p>}
            </div>
            {carregado && <p className="lg:hidden text-sm text-muted-foreground">{contagem}</p>}

            <div className={`space-y-2 transition-opacity ${atualizando ? "opacity-60" : ""}`} aria-busy={atualizando}>
              {isLoading && Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><CardContent className="p-4"><Skeleton className="h-6 w-full" /></CardContent></Card>
              ))}

              {isError && (
                <Card className="border-destructive/40">
                  <CardContent className="p-4 text-sm text-destructive">
                    Erro ao carregar acompanhamentos: {(error as Error)?.message ?? "tente novamente."}
                  </CardContent>
                </Card>
              )}

              {!isLoading && !isError && items.map((item) => {
                const status = item.status as StatusFicha;
                const isAtivo = status === "ATIVO";
                return (
                  <Link key={item.id} to={`/acompanhamentos/${item.id}`}>
                    <Card className={`hover:border-aziz-blue/40 transition-colors cursor-pointer ${!isAtivo ? "opacity-60" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-7 gap-2 items-center text-sm">
                            <span className="font-mono text-xs text-muted-foreground">{item.numeroCaso}</span>
                            <span className="font-mono text-xs text-muted-foreground">{item.codigoFicha}</span>
                            <span className="font-medium text-foreground col-span-2 md:col-span-1">{item.nome}</span>
                            <span className="text-muted-foreground hidden md:block">{item.cpf}</span>
                            <TiposAcompanhamentoTags tipos={item.tiposAcompanhamento ?? []} />
                            <Badge className={STATUS_BADGE_CLASS[status]}>
                              {STATUS_LABEL[status]}
                            </Badge>
                            <span className="text-xs text-muted-foreground hidden md:block">
                              {campoData === "dataCriacao" ? "Criado" : "Atualizado"}: {formatDate(item[campoData])}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
              {!isLoading && !isError && items.length === 0 && !alemDoFim && !atualizando && (
                <p className="text-center text-muted-foreground py-12">Nenhum acompanhamento encontrado.</p>
              )}
            </div>

            {carregado && <PaginacaoAcompanhamentos pagina={pagina} totalPaginas={totalPaginas} onMudar={irParaPagina} />}
          </div>
        </div>
      </div>

      <Sheet open={painelAberto} onOpenChange={setPainelAberto}>
        {/* Foco no painel, não no primeiro botão: senão o "Limpar" abre destacado como se fosse a ação principal. */}
        <SheetContent
          className="flex flex-col gap-0 p-0 focus:outline-none"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement).focus();
          }}
        >
          <SheetHeader className="flex-row items-center justify-between space-y-0 border-b p-4 pr-12">
            <SheetTitle className="text-base">Filtros</SheetTitle>
            {botaoLimpar}
          </SheetHeader>
          <SheetDescription className="sr-only">Os filtros aplicam na hora.</SheetDescription>
          <div className="flex-1 overflow-y-auto p-4">
            <FiltrosAcompanhamentos filtros={filtros} onChange={mudarFiltros} servicos={servicos} tipos={tipos} />
          </div>
          <SheetFooter className="border-t p-4">
            <Button className="w-full" onClick={() => setPainelAberto(false)}>
              Ver {totalItens} {totalItens === 1 ? "resultado" : "resultados"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </Layout>
  );
}
