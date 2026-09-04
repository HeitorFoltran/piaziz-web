import Layout from "@/components/Layout";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FichaForm, type FichaFormSubmitData } from "@/components/ficha/FichaForm";
import { fichaToFormState, avaliacaoToFormState, acolhimentoToFormState, historicoToFormState } from "@/components/ficha/ficha-form-state";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFicha, atualizarFicha, salvarAvaliacaoSocioeconomica, salvarAcolhimentoEquipe, salvarHistoricoAtendimento } from "@/lib/api";

export default function EditarFicha() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: ficha, isLoading } = useQuery({
    queryKey: ["ficha", id],
    queryFn: () => getFicha(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: async (data: FichaFormSubmitData) => {
      const atualizada = await atualizarFicha(id!, data.ficha);
      await Promise.all([
        salvarAvaliacaoSocioeconomica(id!, data.avaliacao),
        salvarAcolhimentoEquipe(id!, data.acolhimento),
        salvarHistoricoAtendimento(id!, data.historico),
      ]);
      return atualizada;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ficha", id] });
      queryClient.invalidateQueries({ queryKey: ["fichas"] });
      queryClient.invalidateQueries({ queryKey: ["acompanhamentos"] });
      toast.success("Ficha atualizada com sucesso!");
      navigate(`/acompanhamentos/${id}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (data: FichaFormSubmitData) => {
    if (!data.ficha.nome.trim() || !data.ficha.cpf.trim()) {
      toast.error("Nome e CPF são obrigatórios.");
      return;
    }
    mutation.mutate(data);
  };

  if (isLoading || !ficha) {
    return (
      <Layout>
        <div className="container py-8 max-w-3xl space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-3xl animate-fade-in">
        <Link
          to={`/acompanhamentos/${id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o acompanhamento
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-1">Editar Ficha PIA</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Ficha {ficha.codigoFicha} — {ficha.nome}
        </p>

        <FichaForm
          initialFicha={fichaToFormState(ficha)}
          initialAvaliacao={avaliacaoToFormState(ficha.avaliacaoSocioeconomica)}
          initialAcolhimento={acolhimentoToFormState(ficha.acolhimentoEquipe)}
          initialHistorico={historicoToFormState(ficha.historicoAtendimento)}
          status={ficha.status}
          onSubmit={handleSubmit}
          submitting={mutation.isPending}
          submitLabel="Salvar Alterações"
          cancelHref={`/acompanhamentos/${id}`}
        />
      </div>
    </Layout>
  );
}
