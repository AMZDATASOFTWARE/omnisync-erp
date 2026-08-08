import React from "react";
import { Input } from "@/components/ui/input";

export default function CountSheet({ items, counts, onCount }) {
  if (!items.length)
    return <p className="text-sm text-muted-foreground py-6">Nenhum produto alocado nesta zona.</p>;

  return (
    <div className="divide-y divide-border">
      {items.map((p) => {
        const raw = counts[p.id];
        const diff = raw === "" || raw === undefined ? null : Number(raw) - (p.stock_quantity || 0);
        return (
          <div key={p.id} className="flex items-center gap-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {[p.sku, p.shelf_identifier].filter(Boolean).join(" · ") || "sem SKU"} · sistema: {p.stock_quantity || 0}
              </p>
            </div>
            <Input type="number" step="0.01" inputMode="decimal" className="w-28"
              placeholder="contado" value={raw ?? ""} onChange={(e) => onCount(p.id, e.target.value)} />
            <span className={`w-16 text-right text-xs ${
              diff === null ? "text-muted-foreground" : diff === 0 ? "text-emerald-600" : "text-destructive"
            }`}>
              {diff === null ? "—" : diff > 0 ? `+${diff}` : diff}
            </span>
          </div>
        );
      })}
    </div>
  );
}