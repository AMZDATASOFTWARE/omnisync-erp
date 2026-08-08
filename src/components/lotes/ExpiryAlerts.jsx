import React from "react";
import { AlertTriangle, CalendarClock, PackageCheck } from "lucide-react";
import { expiryStatus, sortFEFO } from "@/lib/batch";

export default function ExpiryAlerts({ batches }) {
  const live = batches.filter((b) => (b.quantity || 0) > 0);
  const vencidos = live.filter((b) => expiryStatus(b.expiry_date) === "vencido");
  const criticos = live.filter((b) => ["critico", "proximo"].includes(expiryStatus(b.expiry_date)));

  const cards = [
    { label: "Lotes vencidos", value: vencidos.length, icon: AlertTriangle },
    { label: "Vencem em 30 dias", value: criticos.length, icon: CalendarClock },
    { label: "Lotes ativos", value: live.length, icon: PackageCheck },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="brand-card">
            <div className="fc-icon"><Icon className="w-5 h-5" strokeWidth={2} /></div>
            <p className="font-heading text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs" style={{ color: "rgba(242,246,248,.65)" }}>{label}</p>
          </div>
        ))}
      </div>

      {!!(vencidos.length || criticos.length) && (
        <div className="brand-card">
          <h4>Próximos a sair (FEFO)</h4>
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