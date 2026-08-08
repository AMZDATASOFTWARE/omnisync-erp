import React, { useState, useCallback } from "react";

export default function MapCanvas({ map, selectedZoneId, onChange, highlightZoneId, readOnly = false }) {
  const [painting, setPainting] = useState(false);
  const [erasing, setErasing] = useState(false);
  const cols = map.cols || 20;
  const rows = map.rows || 12;
  const zones = map.zones || [];

  const zoneAt = (x, y) => zones.find((z) => z.cells?.some((c) => c.x === x && c.y === y));

  const paintCell = useCallback((x, y, erase) => {
    if (readOnly || !selectedZoneId) return;
    const newZones = zones.map((z) => {
      const cells = (z.cells || []).filter((c) => !(c.x === x && c.y === y));
      if (z.id === selectedZoneId && !erase) cells.push({ x, y });
      return { ...z, cells };
    });
    onChange({ ...map, zones: newZones });
  }, [zones, selectedZoneId, map, onChange, readOnly]);

  const start = (x, y) => {
    if (readOnly || !selectedZoneId) return;
    const current = zoneAt(x, y);
    const erase = current?.id === selectedZoneId;
    setErasing(erase);
    setPainting(true);
    paintCell(x, y, erase);
  };

  return (
    <div className="select-none inline-block" onMouseUp={() => setPainting(false)} onMouseLeave={() => setPainting(false)}>
      <div className="grid gap-[2px] bg-slate-100 p-[2px] rounded-lg"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, width: "100%", minWidth: cols * 26 }}>
        {[...Array(rows)].map((_, y) =>
          [...Array(cols)].map((_, x) => {
            const zone = zoneAt(x, y);
            const isHighlight = highlightZoneId && zone?.id === highlightZoneId;
            return (
              <div key={`${x}-${y}`}
                onMouseDown={() => start(x, y)}
                onMouseEnter={() => painting && paintCell(x, y, erasing)}
                title={zone?.label || ""}
                className={`aspect-square rounded-[3px] transition-colors ${readOnly ? "" : "cursor-crosshair"} ${
                  isHighlight ? "ring-2 ring-emerald-500 ring-offset-1 animate-pulse" : ""
                }`}
                style={{ backgroundColor: zone ? zone.color : "#ffffff" }}
              />
            );
          })
        )}
      </div>
      <div className="flex flex-wrap gap-3 mt-3">
        {zones.map((z) => (
          <span key={z.id} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: z.color }} /> {z.label}
          </span>
        ))}
      </div>
    </div>
  );
}