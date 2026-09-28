import { useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CampoData, FiltrosAcompanhamentos as Filtros } from "@/lib/filtros-acompanhamentos";
import { STATUS_LABEL, type StatusFicha } from "@/lib/status";
import type { Servico, TipoAcompanhamento } from "@/types/api";

interface FiltrosAcompanhamentosProps {
  filtros: Filtros;
  onChange: (mudanca: Partial<Filtros>) => void;
  servicos: Servico[];
  tipos: TipoAcompanhamento[];
}

// Os controles de filtro da lista de Acompanhamentos, empilhados. Usado na coluna lateral
// (computador) e no painel lateral (celular). Os ids vêm do useId porque os dois podem estar
// no DOM ao mesmo tempo, e o Label precisa apontar para o campo do próprio bloco.
export function FiltrosAcompanhamentos({ filtros, onChange, servicos, tipos }: FiltrosAcompanhamentosProps) {
  const id = useId();
  const intervaloInvalido = filtros.de !== "" && filtros.ate !== "" && filtros.de > filtros.ate;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Checkbox id={`${id}-meus`} checked={filtros.meus} onCheckedChange={(v) => onChange({ meus: v === true })} />
        <Label htmlFor={`${id}-meus`}>Criados por mim</Label>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${id}-status`}>Status</Label>
        <Select value={filtros.status} onValueChange={(v) => onChange({ status: v as Filtros["status"] })}>
          <SelectTrigger id={`${id}-status`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {(Object.keys(STATUS_LABEL) as StatusFicha[]).map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${id}-servico`}>Serviço</Label>
        <Select value={filtros.servico} onValueChange={(v) => onChange({ servico: v })}>
          <SelectTrigger id={`${id}-servico`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os serviços</SelectItem>
            {servicos.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${id}-tipo`}>Tipo de acompanhamento</Label>
        <Select value={filtros.tipo} onValueChange={(v) => onChange({ tipo: v })}>
          <SelectTrigger id={`${id}-tipo`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {tipos.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>{t.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${id}-campo-data`}>Data</Label>
        <Select value={filtros.campoData} onValueChange={(v) => onChange({ campoData: v as CampoData })}>
          <SelectTrigger id={`${id}-campo-data`} className="w-full" aria-label="Campo de data">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dataCriacao">Data de criação</SelectItem>
            <SelectItem value="dataAtualizacao">Última atualização</SelectItem>
          </SelectContent>
        </Select>
        {/* min-w-0: o input de data nativo tem largura mínima intrínseca e vaza da coluna sem isso.
            w-7 nos rótulos para os dois campos começarem na mesma linha. */}
        <div className="flex min-w-0 items-center gap-2">
          <Label htmlFor={`${id}-de`} className="w-7 shrink-0 text-xs">De</Label>
          <Input
            id={`${id}-de`}
            type="date"
            className="min-w-0"
            value={filtros.de}
            onChange={(e) => onChange({ de: e.target.value })}
          />
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <Label htmlFor={`${id}-ate`} className="w-7 shrink-0 text-xs">Até</Label>
          <Input
            id={`${id}-ate`}
            type="date"
            className="min-w-0"
            value={filtros.ate}
            onChange={(e) => onChange({ ate: e.target.value })}
          />
        </div>
        {intervaloInvalido && <p className="text-xs text-destructive">A data inicial é depois da final.</p>}
      </div>
    </div>
  );
}
