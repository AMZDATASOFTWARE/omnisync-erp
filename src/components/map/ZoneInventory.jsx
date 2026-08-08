import React from "react";
import { Link } from "react-router-dom";
import { brl } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export default function ZoneInventory({ zone, products }) {
  const items = products.filter((p) => (p.zone_id || p.map_zone_id) === zone.id);
  const valor = items.reduce((a, p) => a + (p.cost_price || p.price || 0) * (p.stock_quantity || 0), 0);
  const repor = items.filter((p) => (p.stock_quantity || 0) <= (p.stock_min ?? p.min_stock ?? 0));

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: zone.color }} />
          {zone.label} — estoque alocado
        </h2>
        <Link to="/produtos" className="text-xs text-emerald-600 hover:underline">Gerenciar estoque</Link>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg border p-2.5">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Produtos</p>
          <p className="font-semibold text-slate-800">{items.length}</p>
        </div>
        <div className="rounded-lg border p-2.5">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Valor em estoque</p>
          <p className="font-semibold text-slate-800">{brl(valor)}</p>
        </div>
        <div className="rounded-lg border p-2.5">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Repor</p>
          <p className={`font-semibold ${repor.length ? "text-amber-600" : "text-slate-800"}`}>{repor.length}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-slate-400">Nenhum produto alocado nesta zona. Defina a zona no cadastro do produto.</p>
      ) : (
        <div className="max-h-56 overflow-y-auto divide-y">
          {items.map((p) => {
            const baixo = (p.stock_quantity || 0) <= (p.stock_min ?? p.min_stock ?? 0);
            return (
              <div key={p.id} className="py-2 flex items-center justify-between text-sm">
                <div className="min-w-0 pr-2">
                  <p className="text-slate-800 truncate">{p.name}</p>
                  <p className="text-[11px] text-slate-400">{p.shelf_identifier || p.shelf_label || "sem prateleira"} · {brl(p.price)}</p>
                </div>
                <Badge variant="outline" className={baixo ? "text-amber-700 border-amber-300 bg-amber-50 shrink-0" : "shrink-0"}>
                  {baixo && <AlertTriangle className="w-3 h-3 mr-1" />}
                  {p.stock_quantity ?? 0} {p.unit || "un"}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}