import Layout from "@/components/Layout";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FichaForm, type FichaFormSubmitData } from "@/components/ficha/FichaForm";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { createFicha, salvarAvaliacaoSocioeconomica, salvarAcolhimentoEquipe, salvarHistoricoAtendimento } from "@/lib/api";

export default function NovaFicha() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (data: FichaFormSubmitData) => {
      const ficha = await createFicha(data.ficha);
      await Promise.all([
        salvarAvaliacaoSocioeconomica(ficha.id, data.avaliacao),
        salvarAcolhimentoEquipe(ficha.id, data.acolhimento),
        salvarHistoricoAtendimento(ficha.id, data.historico),
      ]);
      return ficha;
    },
    onSuccess: () => {
      toast.success("Ficha salva com sucesso!");
      navigate("/cadastros");
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

  return (
    <Layout>
      <div className="container py-8 max-w-3xl animate-fade-in">
        <Link to="/cadastros" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar para cadastros
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-2">Plano Individual de Atendimento</h1>
        <p className="text-sm text-muted-foreground mb-8">Preencha as informações abaixo para cadastrar uma nova ficha PIA.</p>

        <FichaForm
          status="ATIVO"
          onSubmit={handleSubmit}
          submitting={mutation.isPending}
          submitLabel="Salvar Ficha"
          cancelHref="/cadastros"
        />
      </div>
    </Layout>
  );
}
