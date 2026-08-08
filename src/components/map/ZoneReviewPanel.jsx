import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarCheck, AlertTriangle } from "lucide-react";
import { differenceInDays, format } from "date-fns";

const STALE_DAYS = 90;

export const zoneReviewDays = (zone) =>
  zone.reviewed_at ? differenceInDays(new Date(), new Date(zone.reviewed_at)) : null;

// Risco do SDD: mapa desatualizado após remanejo → alerta de zona sem revisão.
export default function ZoneReviewPanel({ zones, onReview, onSelect }) {
  const stale = zones.filter((z) => {
    const d = zoneReviewDays(z);
    return d === null || d >= STALE_DAYS;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3 h-fit">
      <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <CalendarCheck className="w-4 h-4 text-emerald-600" /> Revisão das zonas
      </h2>

      {zones.length === 0 ? (
        <p className="text-xs text-slate-400">Nenhuma zona cadastrada.</p>
      ) : stale.length === 0 ? (
        <p className="text-xs text-emerald-600">Todas as zonas foram revisadas nos últimos {STALE_DAYS} dias.</p>
      ) : (
        <p className="text-xs text-amber-600 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          {stale.length} zona(s) sem revisão há {STALE_DAYS}+ dias — o mapa pode estar desatualizado.
        </p>
      )}

      <div className="space-y-1.5">
        {zones.map((z) => {
          const days = zoneReviewDays(z);
          const isStale = days === null || days >= STALE_DAYS;
          return (
            <div key={z.id} className="flex items-center gap-2">
              <button onClick={() => onSelect(z.id)} className="flex-1 min-w-0 text-left">
                <p className="text-sm text-slate-800 truncate">{z.label}</p>
                <p className={`text-[11px] ${isStale ? "text-amber-600" : "text-slate-400"}`}>
                  {z.reviewed_at
                    ? `Revisada em ${format(new Date(z.reviewed_at), "dd/MM/yyyy")} (${days}d)`
                    : "Nunca revisada"}
                </p>
              </button>
              <Button size="sm" variant="outline" className="h-7 shrink-0" onClick={() => onReview(z.id)}>
                Revisar
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}