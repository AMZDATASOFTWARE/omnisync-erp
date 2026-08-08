import React from "react";
import { HEAT_MODES, HEAT_COLOR } from "@/lib/heat";

export default function HeatControls({ mode, onChange, heat, zones }) {
  const ranking = heat
    ? [...zones]
        .map((z) => ({ ...z, ...heat.zones[z.id] }))
        .filter((z) => z.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
    : [];

  return (
    <div className="brand-card space-y-3">
      <h4>Camadas analíticas</h4>
      <div className="flex flex-wrap gap-1.5">
        {HEAT_MODES.map((m) => (
          <button key={m.id} onClick={() => onChange(m.id)}
            className={`px-3 h-8 rounded-md text-xs ${mode === m.id ? "brand-btn-primary-card" : "brand-btn-secondary"}`}>
            {m.label}
          </button>
        ))}
      </div>
      {heat && (
        <div className="space-y-1.5">
          {ranking.length === 0 && <p>Nenhum dado nesta camada ainda.</p>}
          {ranking.map((z) => (
            <div key={z.id} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: HEAT_COLOR[heat.mode] }} />
              <span className="flex-1 truncate">{z.label}</span>
              <strong>{z.text}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}