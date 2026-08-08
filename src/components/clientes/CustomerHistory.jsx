import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { brl } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function CustomerHistory({ customer }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!customer?.id) return;
    Promise.all([
      base44.entities.Sale.filter({ customer_id: customer.id }, "-created_date", 50),
      base44.entities.FinancialEntry.filter({ type: "receber", status: "pendente" }, "due_date", 100),
    ]).then(([sales, entries]) => {
      setData({ sales, entries: entries.filter((e) => e.related_party === customer.name) });
    });
  }, [customer]);

  if (!data) return <p className="text-sm text-slate-400">Carregando histórico…</p>;

  const totalAberto = data.entries.reduce((a, e) => a + (e.amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg border p-3">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Compras</p>
          <p className="font-semibold text-slate-800">{data.sales.length}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Consumido</p>
          <p className="font-semibold text-slate-800">{brl(customer.total_spent)}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Em aberto</p>
          <p className={`font-semibold ${totalAberto > 0 ? "text-rose-600" : "text-slate-800"}`}>{brl(totalAberto)}</p>
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto divide-y">
        {data.sales.length === 0 && <p className="text-sm text-slate-400 py-4">Nenhuma compra registrada.</p>}
        {data.sales.map((s) => (
          <div key={s.id} className="py-2.5 flex items-center justify-between text-sm">
            <div>
              <p className="text-slate-700">{format(new Date(s.created_date), "dd/MM/yyyy HH:mm")}</p>
              <p className="text-xs text-slate-400">
                {(s.items || []).map((i) => `${i.quantity}× ${i.name}`).join(", ") || "—"}
              </p>
            </div>
            <div className="text-right shrink-0 pl-3">
              <p className="font-medium text-slate-800">{brl(s.total)}</p>
              <Badge variant="outline" className="text-[10px]">
                {s.fiscal_status === "emitida" ? `NFC-e ${s.fiscal_number}` : "sem NFC-e"}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}