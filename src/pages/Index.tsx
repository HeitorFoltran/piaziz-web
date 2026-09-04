import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { FileText, Eye, TrendingUp, Clock, Users, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/api";

const PALETTE = [
  "hsl(228, 48%, 46%)",
  "hsl(140, 55%, 40%)",
  "hsl(36,  90%, 52%)",
  "hsl(280, 50%, 50%)",
  "hsl(0,   65%, 52%)",
  "hsl(190, 70%, 42%)",
  "hsl(56,  88%, 45%)",
  "hsl(330, 60%, 50%)",
];

function corPorIndice(i: number) {
  return PALETTE[i % PALETTE.length];
}

export default function Index() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const pieData =
    data?.encaminhamentosPorTipo.map((e, i) => ({
      name: e.label,
      value: e.total,
      color: corPorIndice(i),
    })) ?? [];

  const barData =
    data?.fichasPorMes.map((f) => ({
      mes: f.mes,
      fichas: f.total,
    })) ?? [];

  const statsCards = [
    { label: "Fichas ativas",          value: data?.totalFichasAtivas,           icon: Users },
    { label: "Encaminhamentos",        value: data?.totalEncaminhamentos,         icon: TrendingUp },
    { label: "Aguardando retorno",     value: data?.fichasAguardandoRetorno,      icon: Clock },
    { label: "Sem atualização (30d)",  value: data?.fichasSemAtualizacao30Dias,   icon: AlertTriangle },
  ];

  return (
    <Layout>
      <div className="relative overflow-hidden" style={{ background: "var(--gradient-banner)" }}>
        <div className="container py-10 relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
            PIA – Plano Individual de Atendimento
          </h1>
          <p className="text-sm md:text-base text-primary/80 max-w-lg">
            Realizar a assistência necessária a partir do cadastro da ficha pessoal do PIA, assim iniciando um novo acompanhamento de caso.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-aziz-yellow/30 skew-x-[-20deg] translate-x-20" />
      </div>

      <div className="container py-8 space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/cadastros?tab=fichas&action=nova" className="group">
            <Card className="border-2 border-border hover:border-aziz-green transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 rounded-lg bg-aziz-green/10 flex items-center justify-center text-aziz-green group-hover:bg-aziz-green group-hover:text-primary-foreground transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Iniciar nova ficha</h3>
                  <p className="text-sm text-muted-foreground">Inicie um processo de atendimento jurídico</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/acompanhamentos" className="group">
            <Card className="border-2 border-border hover:border-aziz-blue transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 rounded-lg bg-aziz-blue/10 flex items-center justify-center text-aziz-blue group-hover:bg-aziz-blue group-hover:text-primary-foreground transition-colors">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Visualizar acompanhamentos</h3>
                  <p className="text-sm text-muted-foreground">Acesse os processos de atendimento jurídico</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {isError && (
          <Card className="border-destructive/40">
            <CardContent className="p-4 text-sm text-destructive">
              Erro ao carregar o dashboard: {(error as Error)?.message ?? "tente novamente."}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</span>
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stat.value ?? "—"}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Encaminhamentos por serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center">
                {isLoading ? (
                  <Skeleton className="h-40 w-40 rounded-full mx-auto" />
                ) : pieData.length === 0 ? (
                  <p className="text-sm text-muted-foreground mx-auto">Sem dados.</p>
                ) : (
                  <>
                    <ResponsiveContainer width="50%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          dataKey="value"
                          strokeWidth={2}
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 flex-1">
                      {pieData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-muted-foreground truncate">{item.name}</span>
                          <span className="font-medium text-foreground ml-auto">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fichas abertas por mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : barData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem dados.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <XAxis dataKey="mes" axisLine={false} tickLine={false} className="text-xs" />
                      <YAxis axisLine={false} tickLine={false} className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="fichas" fill="hsl(216,93%,12%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}