import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, QrCode } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";

interface LinkConviteProps {
  link: string;
  dataExpiracao: string;
  /** Logo depois de gerar: avisa que o link continua acessível pela lista. */
  avisoLista?: boolean;
}

// Link de preenchimento pronto para copiar ou mostrar como QR Code. Usado logo depois de gerar
// e em cada link ativo da lista.
export function LinkConvite({ link, dataExpiracao, avisoLista = false }: LinkConviteProps) {
  // Escondido por padrão: o link é secreto até ser usado, e a tela pode estar à vista de outras pessoas.
  const [mostrarQr, setMostrarQr] = useState(false);

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
        <div className="flex flex-1 min-w-0 gap-2">
          <Input value={link} readOnly className="min-w-0 text-xs" onFocus={(e) => e.target.select()} />
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
        Vale para um único envio, até {formatDate(dataExpiracao)}.
        {avisoLista && " Enquanto estiver ativo, o link também aparece na lista abaixo."}
      </p>
    </div>
  );
}
