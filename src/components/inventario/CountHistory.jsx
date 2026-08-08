import React from "react";
import { brl } from "@/lib/format";

export default function CountHistory({ counts }) {
  if (!counts.length)
    return <p className="text-sm text-muted-foreground">Nenhuma contagem registrada ainda.</p>;

  return (
    <div className="divide-y divide-border">
      {counts.map((c) => (
        <div key={c.id} className="py-2.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-foreground truncate">{c.zone_label || c.zone_id}</p>
            <p className="text-xs text-muted-foreground">
              {c.finished_at ? new Date(c.finished_at).toLocaleString("pt-BR") : "em andamento"} · {c.items_count || 0} itens
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-sm ${c.divergences ? "text-destructive" : "text-emerald-600"}`}>
              {c.divergences || 0} divergência{c.divergences === 1 ? "" : "s"}
            </p>
            <p className="text-xs text-muted-foreground">{brl(c.value_diff || 0)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}