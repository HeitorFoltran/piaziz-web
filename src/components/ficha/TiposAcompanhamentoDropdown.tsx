import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TiposAcompanhamentoTags } from "./TiposAcompanhamentoTags";
import type { TipoAcompanhamento } from "@/types/api";

interface TiposAcompanhamentoDropdownProps {
  catalogo: TipoAcompanhamento[];
  selecionados: TipoAcompanhamento[];
  onToggle: (tipo: TipoAcompanhamento, checked: boolean) => void;
  disabled?: boolean;
}

export function TiposAcompanhamentoDropdown({
  catalogo,
  selecionados,
  onToggle,
  disabled,
}: TiposAcompanhamentoDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selecionadosIds = new Set(selecionados.map((t) => t.id));

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        className="flex h-7 min-w-[140px] items-center justify-between gap-2 rounded-md border border-input bg-background px-2 text-xs disabled:opacity-50"
      >
        {selecionados.length === 0 ? (
          <span className="text-muted-foreground">Selecione</span>
        ) : (
          <TiposAcompanhamentoTags tipos={selecionados} />
        )}
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-56 rounded-md border bg-popover p-2 shadow-md">
          {catalogo.length === 0 ? (
            <p className="text-xs text-muted-foreground p-1">
              Nenhum tipo cadastrado — cadastre em Cadastros &gt; Tipos de Acompanhamento.
            </p>
          ) : (
            <div className="space-y-1 max-h-56 overflow-auto">
              {catalogo.map((tipo) => (
                <div key={tipo.id} className="flex items-center gap-2 rounded px-1 py-1 hover:bg-accent">
                  <Checkbox
                    id={`tipo-acomp-${tipo.id}`}
                    checked={selecionadosIds.has(tipo.id)}
                    disabled={disabled}
                    onCheckedChange={(checked) => onToggle(tipo, checked === true)}
                  />
                  <Label htmlFor={`tipo-acomp-${tipo.id}`} className="cursor-pointer text-sm font-normal">
                    {tipo.nome}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
