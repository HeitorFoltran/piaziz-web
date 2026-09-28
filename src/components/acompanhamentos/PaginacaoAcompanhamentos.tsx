import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginacaoAcompanhamentosProps {
  /** Base 1, como na URL. */
  pagina: number;
  totalPaginas: number;
  onMudar: (pagina: number) => void;
}

// Anterior · Página x de y · Próxima, abaixo da lista. Some quando tudo cabe numa página.
// As setas só aparecem a partir de sm: em 360px, com elas, os três não cabem numa linha.
export function PaginacaoAcompanhamentos({ pagina, totalPaginas, onMudar }: PaginacaoAcompanhamentosProps) {
  if (totalPaginas <= 1) return null;

  return (
    <nav aria-label="Paginação" className="flex items-center justify-between gap-2 pt-2">
      <Button
        variant="outline"
        size="sm"
        aria-label="Página anterior"
        disabled={pagina <= 1}
        onClick={() => onMudar(pagina - 1)}
      >
        <ChevronLeft className="hidden sm:block" />
        Anterior
      </Button>
      <p className="whitespace-nowrap text-sm text-muted-foreground">
        Página {pagina} de {totalPaginas}
      </p>
      <Button
        variant="outline"
        size="sm"
        aria-label="Próxima página"
        disabled={pagina >= totalPaginas}
        onClick={() => onMudar(pagina + 1)}
      >
        Próxima
        <ChevronRight className="hidden sm:block" />
      </Button>
    </nav>
  );
}
