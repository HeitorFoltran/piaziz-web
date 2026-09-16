import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getRelatorios } from "@/lib/api";
import { PALETTE } from "@/lib/chartColors";
import type { PontoSerie } from "@/types/api";

type Granularidade = "dia" | "semana" | "mes";

const GRANULARIDADES: { value: Granularidade; label: string }[] = [
  { value: "dia", label: "Dia" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
];

function SerieChart({ data, color }: { data: PontoSerie[]; color: string }) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Sem dados suficientes ainda.</p>
      </div>
    );
  }
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="periodo" axisLine={false} tickLine={false} className="text-xs" />
          <YAxis axisLine={false} tickLine={false} className="text-xs" allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="total" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Relatorios() {
  const [granularidade, setGranularidade] = useState<Granularidade>("mes");
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["relatorios", granularidade],
    queryFn: () => getRelatorios(granularidade),
  });

  const statsCards = [
    { label: "Total de cadastros", value: data?.totalCadastros },
    { label: "Total de encaminhamentos", value: data?.totalEncaminhamentos },
    {
      label: "% cadastros encaminhados",
      value: data ? `${data.percentualCadastrosEncaminhados.toFixed(1)}%` : undefined,
    },
    {
      label: "Taxa conversão encaminhamento → atendimento",
      value: data ? `${data.taxaConversaoEncaminhamentoAtendimento.toFixed(1)}%` : undefined,
    },
  ];

  return (
    <Layout>
      <div className="container py-8 space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Indicadores analíticos de cadastros, encaminhamentos e atendimentos.</p>
        </div>

        {isError && (
          <Card className="border-destructive/40">
            <CardContent className="p-4 text-sm text-destructive">
              Erro ao carregar relatórios: {(error as Error)?.message ?? "tente novamente."}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</span>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-foreground mt-2">{stat.value ?? "—"}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Tempo médio cadastro → atendimento
              </span>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-2" />
              ) : data?.tempoMedioCadastroAtendimentoDias == null ? (
                <p className="text-sm text-muted-foreground mt-2">Dados insuficientes ainda.</p>
              ) : (
                <p className="text-2xl font-bold text-foreground mt-2">
                  {data.tempoMedioCadastroAtendimentoDias.toFixed(1)} dias
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Cadastros (média)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-6 w-full" />
              ) : (
                <p className="text-sm text-foreground">
                  {data?.mediaCadastrosPorMes.toFixed(1)}/mês · {data?.mediaCadastrosPorSemana.toFixed(1)}/semana ·{" "}
                  {data?.mediaCadastrosPorDia.toFixed(1)}/dia
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Encaminhamentos (média)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-6 w-full" />
              ) : (
                <p className="text-sm text-foreground">
                  {data?.mediaEncaminhamentosPorMes.toFixed(1)}/mês · {data?.mediaEncaminhamentosPorSemana.toFixed(1)}/semana ·{" "}
                  {data?.mediaEncaminhamentosPorDia.toFixed(1)}/dia
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-2">
          {GRANULARIDADES.map((g) => (
            <Button
              key={g.value}
              size="sm"
              variant={granularidade === g.value ? "default" : "outline"}
              onClick={() => setGranularidade(g.value)}
            >
              {g.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progressão de cadastros</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-64 w-full" /> : <SerieChart data={data?.progressaoCadastros ?? []} color={PALETTE[0]} />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progressão de encaminhamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-64 w-full" /> : <SerieChart data={data?.progressaoEncaminhamentos ?? []} color={PALETTE[1]} />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progressão de atendimentos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-64 w-full" /> : <SerieChart data={data?.progressaoAtendimentos ?? []} color={PALETTE[2]} />}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
