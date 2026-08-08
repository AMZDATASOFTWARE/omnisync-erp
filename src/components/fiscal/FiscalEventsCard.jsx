import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSignature, Scissors } from "lucide-react";
import { format } from "date-fns";

const LABELS = {
  carta_correcao: "Carta de correção",
  inutilizacao: "Inutilização",
  cancelamento: "Cancelamento",
};

export default function FiscalEventsCard({ events, onVoid }) {
  return (
    <div className="bg-card rounded-xl border p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-sm flex items-center gap-2">
            <FileSignature className="w-4 h-4 text-primary" /> Eventos fiscais
          </p>
          <p className="text-xs text-muted-foreground">
            Cartas de correção e inutilizações de numeração registradas.
          </p>
        </div>
        <Button variant="outline" onClick={onVoid}>
          <Scissors className="w-4 h-4" /> Inutilizar numeração
        </Button>
      </div>

      {events.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum evento registrado.</p>
      ) : (
        <ul className="divide-y">
          {events.map((e) => (
            <li key={e.id} className="py-2 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm flex items-center gap-2">
                  <Badge variant="secondary">{LABELS[e.tipo] || e.tipo}</Badge>
                  {e.tipo === "inutilizacao"
                    ? `Série ${e.serie} · ${e.numero_inicial}–${e.numero_final}`
                    : `NFC-e ${e.numero || ""} · seq. ${e.sequencia || 1}`}
                </p>
                <p className="text-xs text-muted-foreground truncate">{e.correcao || e.justificativa}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] text-muted-foreground">{format(new Date(e.created_date), "dd/MM HH:mm")}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{e.protocolo}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}