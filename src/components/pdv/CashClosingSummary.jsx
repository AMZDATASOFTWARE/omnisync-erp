import React from "react";
import { brl } from "@/lib/format";

export default function CashClosingSummary({ result }) {
  const rows = [
    ["Fundo de abertura", result.opening_amount],
    ["Vendas em dinheiro", result.cash_sales],
    ["Reforços", result.reforcos],
    ["Sangrias", -result.sangrias],
    ["Esperado em caixa", result.expected_amount],
    ["Contado", result.counted_amount],
  ];
  const diff = result.difference || 0;
  return (
    <div className="space-y-1.5 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium text-foreground">{brl(value)}</span>
        </div>
      ))}
      <div className="flex justify-between border-t border-border pt-2 mt-2">
        <span className="font-medium">Diferença</span>
        <span className={`font-heading font-bold ${Math.abs(diff) < 0.01 ? "text-emerald-600" : diff > 0 ? "text-amber-600" : "text-rose-600"}`}>
          {brl(diff)}
        </span>
      </div>
      {result.divergence_entry_id ? (
        <p className="text-xs text-muted-foreground pt-1">
          A {diff > 0 ? "sobra" : "quebra"} de caixa foi lançada automaticamente no Financeiro (categoria Caixa).
        </p>
      ) : (
        <p className="text-xs text-emerald-600 pt-1">Caixa conferido sem divergência.</p>
      )}
    </div>
  );
}