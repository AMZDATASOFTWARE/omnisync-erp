import React from "react";
import { brl } from "@/lib/format";

const color = { A: "bg-emerald-500/15 text-emerald-600", B: "bg-amber-500/15 text-amber-600", C: "bg-muted text-muted-foreground" };

export default function ABCTable({ rows }) {
  if (!rows.length) return <p className="text-sm text-muted-foreground py-6">Sem vendas no período.</p>;

  const counts = rows.reduce((acc, r) => ({ ...acc, [r.klass]: (acc[r.klass] || 0) + 1 }), {});

  return (
    <div>
      <div className="flex gap-2 mb-3">
        {["A", "B", "C"].map((k) => (
          <span key={k} className={`text-xs px-2.5 py-1 rounded-full ${color[k]}`}>
            Classe {k}: {counts[k] || 0} itens
          </span>
        ))}
      </div>
      <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
        {rows.map((r) => (
          <div key={r.id || r.name} className="flex items-center gap-3 py-2.5">
            <span className={`text-xs w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${color[r.klass]}`}>{r.klass}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground truncate">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.qty} un · margem {brl(r.margin)}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm text-foreground">{brl(r.revenue)}</p>
              <p className="text-xs text-muted-foreground">{(r.share * 100).toFixed(1)}% do total</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}