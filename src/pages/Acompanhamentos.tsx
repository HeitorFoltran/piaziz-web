import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getAcompanhamentos, getServicos } from "@/lib/api";
import { formatDate } from "@/lib/format";

const statusOptions = [
  { value: "all", label: "Todos os status" },
  { value: "ATIVO", label: "Ativo" },
  { value: "INATIVO", label: "Inativo" },
];

export default function Acompanhamentos() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterServico, setFilterServico] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["acompanhamentos", debouncedSearch, filterServico],
    queryFn: () =>
      getAcompanhamentos({
        q: debouncedSearch || undefined,
        servicoId: filterServico === "all" ? undefined : filterServico,
      }),
  });

  const { data: servicos = [] } = useQuery({
    queryKey: ["servicos"],
    queryFn: getServicos,
  });

  const items = (data ?? []).filter((item) =>
    filterStatus === "all" ? true : item.status === filterStatus
  );

  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground mb-6">Acompanhamentos</h1>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, nº caso, ficha ou CPF..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterServico} onValueChange={setFilterServico}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os serviços</SelectItem>
                  {servicos.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
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
            const isAtivo = item.status !== "INATIVO";
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
                        <Badge className="bg-aziz-blue/10 text-aziz-blue border-aziz-blue/20">
                          {item.encaminhamento ?? "—"}
                        </Badge>
                        <Badge
                          className={isAtivo
                            ? "bg-aziz-green/10 text-aziz-green border-aziz-green/20"
                            : "bg-muted text-muted-foreground border-border"}
                        >
                          {isAtivo ? "Ativo" : "Inativo"}
                        </Badge>
                        <span className="text-xs text-muted-foreground hidden md:block">
                          Atualizado: {formatDate(item.dataAtualizacao)}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {!isLoading && !isError && items.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Nenhum acompanhamento encontrado.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}