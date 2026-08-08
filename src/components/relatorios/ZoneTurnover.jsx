import React from "react";
import { Link } from "react-router-dom";
import { brl } from "@/lib/format";

export default function ZoneTurnover({ rows }) {
  if (!rows.length) return <p className="text-sm text-muted-foreground">Nenhuma zona cadastrada no mapa.</p>;
  const max = Math.max(...rows.map((r) => r.revenue), 1);

  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <Link key={r.id} to={`/mapa?zone=${r.id}`} className="block group">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-foreground truncate group-hover:text-primary">{r.label}</span>
            <span className="text-muted-foreground shrink-0 text-xs">
              {r.qty} un · {brl(r.revenue)} · giro {r.turns.toFixed(2)}x
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${(r.revenue / max) * 100}%` }} />
          </div>
        </Link>
      ))}
    </div>
  );
}