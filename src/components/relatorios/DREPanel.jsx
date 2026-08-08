import React from "react";
import { brl } from "@/lib/format";

const pct = (v) => `${(v * 100).toFixed(1)}%`;

export default function DREPanel({ data }) {
  const rows = [
    { label: "Receita bruta de vendas", value: data.revenue },
    { label: "(–) Custo das mercadorias vendidas", value: -data.cogs },
    { label: "= Lucro bruto", value: data.gross, strong: true, hint: pct(data.grossMargin) },
    { label: "(–) Despesas pagas no período", value: -data.expenses },
    { label: "= Resultado líquido", value: data.net, strong: true, hint: pct(data.netMargin) },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">DRE gerencial</p>
      <div className="divide-y divide-border">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3 py-2.5">
            <span className={`text-sm ${r.strong ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{r.label}</span>
            <span className="text-right shrink-0">
              <span className={`text-sm ${r.value < 0 ? "text-destructive" : r.strong ? "text-emerald-600 font-semibold" : "text-foreground"}`}>
                {brl(r.value)}
              </span>
              {r.hint && <span className="text-xs text-muted-foreground ml-2">{r.hint}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}