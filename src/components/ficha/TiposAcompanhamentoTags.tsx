import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { TipoAcompanhamento } from "@/types/api";

interface TiposAcompanhamentoTagsProps {
  tipos: TipoAcompanhamento[];
  emptyLabel?: string;
}

export function TiposAcompanhamentoTags({ tipos, emptyLabel = "—" }: TiposAcompanhamentoTagsProps) {
  if (tipos.length === 0) {
    return <span className="text-muted-foreground text-xs">{emptyLabel}</span>;
  }

  const [primeiro, ...resto] = tipos;

  return (
    <div className="flex items-center gap-1">
      <Badge className="bg-aziz-blue/10 text-aziz-blue border-aziz-blue/20">{primeiro.nome}</Badge>
      {resto.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="bg-muted text-muted-foreground border-transparent cursor-default">
              +{resto.length}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>{resto.map((t) => t.nome).join(", ")}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
