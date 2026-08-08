import React from "react";
import { AlertTriangle, CalendarClock, PackageCheck } from "lucide-react";
import { expiryStatus, sortFEFO } from "@/lib/batch";

export default function ExpiryAlerts({ batches }) {
  const live = batches.filter((b) => (b.quantity || 0) > 0);
  const vencidos = live.filter((b) => expiryStatus(b.expiry_date) === "vencido");
  const criticos = live.filter((b) => ["critico", "proximo"].includes(expiryStatus(b.expiry_date)));

  const cards = [
    { label: "Lotes vencidos", value: vencidos.length, icon: AlertTriangle, cls: "text-red-600 bg-red-50" },
    { label: "Vencem em 30 dias", value: criticos.length, icon: CalendarClock, cls: "text-amber-600 bg-amber-50" },
    { label: "Lotes ativos", value: live.length, icon: PackageCheck, cls: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {cards.map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cls}`}><Icon className="w-4 h-4" /></div>
            <p className="text-2xl font-semibold text-slate-900 mt-2">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {!!(vencidos.length || criticos.length) && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-4">
          <p className="text-sm font-semibold text-slate-900 mb-2">Próximos a sair (FEFO)</p>
          <ul className="space-y-1.5">
            {sortFEFO([...vencidos, ...criticos]).slice(0, 6).map((b) => (
              <li key={b.id} className="text-xs flex justify-between text-slate-600">
                <span>{b.product_name} · {b.lot_code || "s/ lote"}</span>
                <span className={expiryStatus(b.expiry_date) === "vencido" ? "text-red-600" : "text-amber-600"}>
                  {new Date(b.expiry_date + "T00:00:00").toLocaleDateString("pt-BR")} · {b.quantity} un
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}