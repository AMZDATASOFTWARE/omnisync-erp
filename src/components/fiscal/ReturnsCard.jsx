import React from "react";
import { Badge } from "@/components/ui/badge";
import { Undo2 } from "lucide-react";
import { format } from "date-fns";

const brl = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

export default function ReturnsCard({ returns }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
        <Undo2 className="w-4 h-4 text-emerald-600" /> Devoluções
      </h2>
      {returns.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma devolução registrada.</p>
      ) : (
        <ul className="divide-y">
          {returns.map((r) => (
            <li key={r.id} className="py-2.5 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground text-xs">
                {format(new Date(r.created_date), "dd/MM HH:mm")}
              </span>
              <Badge variant="secondary">{r.tipo}</Badge>
              <span className="flex-1 min-w-0 truncate">{r.motivo}</span>
              <span className="font-medium">{brl(r.total)}</span>
              {r.fiscal_status === "emitida" ? (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  Nota de devolução {r.fiscal_number}
                </Badge>
              ) : r.fiscal_status === "erro" ? (
                <Badge variant="destructive">{r.fiscal_error}</Badge>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}