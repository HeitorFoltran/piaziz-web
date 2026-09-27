import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Link2, QrCode } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { criarConviteFicha } from "@/lib/api";
import { formatDate } from "@/lib/format";

// O link só existe na resposta da criação (o backend guarda apenas o hash do token),
// então ele é mostrado uma vez aqui e não dá pra recuperar depois pela listagem.
export function GerarConviteLink() {
  const queryClient = useQueryClient();
  // Escondido por padrão: o link é secreto até ser usado, e a tela pode estar à vista de outras pessoas.
  const [mostrarQr, setMostrarQr] = useState(false);
  const gerar = useMutation({
    mutationFn: criarConviteFicha,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["convites-ficha"] }),
    onError: (err: Error) => toast.error(err.message),
  });

  const convite = gerar.data;

  if (!convite?.linkCompleto) {
    return (
      <Button onClick={() => gerar.mutate()} disabled={gerar.isPending} variant="outline" className="w-full">
        <Link2 className="w-4 h-4 mr-2" />
        {gerar.isPending ? "Gerando..." : "Gerar link de preenchimento"}
      </Button>
    );
  }

  const link = convite.linkCompleto;
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copiado!");
    } catch {
      toast.error("Não foi possível copiar. Selecione o link e copie manualmente.");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 gap-2">
          <Input value={link} readOnly className="text-xs" onFocus={(e) => e.target.select()} />
          <Button variant="outline" size="icon" onClick={copiar} aria-label="Copiar link" className="shrink-0">
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={() => setMostrarQr((v) => !v)} className="shrink-0">
          <QrCode className="w-4 h-4 mr-2" />
          {mostrarQr ? "Esconder QR Code" : "Mostrar QR Code"}
        </Button>
      </div>
      {mostrarQr && (
        <div className="flex flex-col items-center gap-2 py-2">
          {/* SVG gerado no navegador: sem requisição externa nem imagem data:, então a CSP não muda.
              Fundo branco e margem explícitos para a câmera conseguir ler mesmo no tema escuro. */}
          <QRCodeSVG
            value={link}
            size={200}
            level="M"
            marginSize={4}
            bgColor="#ffffff"
            fgColor="#000000"
            title="QR Code do link de preenchimento"
          />
          <p className="text-xs text-muted-foreground text-center">
            Peça para a pessoa apontar a câmera do celular para o código. Depois que ela abrir o formulário, esconda o
            QR Code.
          </p>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Vale para um único envio, até {formatDate(convite.dataExpiracao)}. Copie agora — este link não
        pode ser exibido de novo.
      </p>
    </div>
  );
}
