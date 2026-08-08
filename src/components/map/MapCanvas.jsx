import React, { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize, Hand, Brush } from "lucide-react";

const CELL = 28;

export default function MapCanvas({ map, selectedZoneId, onChange, highlightZoneId, pin, onZoneClick, readOnly = false }) {
  const cols = map.cols || 20;
  const rows = map.rows || 12;
  const zones = map.zones || [];

  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const [tool, setTool] = useState("brush"); // brush | pan
  const [painting, setPainting] = useState(false);
  const [erasing, setErasing] = useState(false);
  const panRef = useRef(null);

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

  const startCell = (x, y) => {
    const zone = zoneAt(x, y);
    if (zone && onZoneClick) onZoneClick(zone.id);
    if (readOnly || tool !== "brush" || !selectedZoneId) return;
    const erase = zone?.id === selectedZoneId;
    setErasing(erase);
    setPainting(true);
    paintCell(x, y, erase);
  };

  const zoom = (f) => setView((v) => ({ ...v, scale: Math.min(3, Math.max(0.4, v.scale * f)) }));
  const reset = () => setView({ scale: 1, x: 0, y: 0 });

  const onWheel = (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    zoom(e.deltaY < 0 ? 1.1 : 0.9);
  };

  const onMouseDown = (e) => {
    if (tool !== "pan") return;
    panRef.current = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y };
  };
  const onMouseMove = (e) => {
    if (!panRef.current) return;
    const { sx, sy, ox, oy } = panRef.current;
    setView((v) => ({ ...v, x: ox + (e.clientX - sx), y: oy + (e.clientY - sy) }));
  };
  const stop = () => { panRef.current = null; setPainting(false); };

  const W = cols * CELL;
  const H = rows * CELL;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          <button onClick={() => setTool("brush")}
            className={`px-3 h-8 text-xs flex items-center gap-1.5 ${tool === "brush" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
            <Brush className="w-3.5 h-3.5" /> Desenhar
          </button>
          <button onClick={() => setTool("pan")}
            className={`px-3 h-8 text-xs flex items-center gap-1.5 border-l border-slate-200 ${tool === "pan" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
            <Hand className="w-3.5 h-3.5" /> Mover
          </button>
        </div>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => zoom(1.2)}><ZoomIn className="w-3.5 h-3.5" /></Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => zoom(0.8)}><ZoomOut className="w-3.5 h-3.5" /></Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={reset}><Maximize className="w-3.5 h-3.5" /></Button>
        <span className="text-xs text-slate-400 ml-1">{Math.round(view.scale * 100)}%</span>
      </div>

      <div className="rounded-lg bg-slate-50 border border-slate-100 overflow-hidden select-none"
        onWheel={onWheel} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={stop} onMouseLeave={stop}
        style={{ cursor: tool === "pan" ? "grab" : "crosshair" }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W} / ${H}` }}>
          <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
            {[...Array(rows)].map((_, y) =>
              [...Array(cols)].map((_, x) => {
                const zone = zoneAt(x, y);
                const isHighlight = highlightZoneId && zone?.id === highlightZoneId;
                return (
                  <rect key={`${x}-${y}`} x={x * CELL} y={y * CELL} width={CELL - 1} height={CELL - 1} rx="3"
                    fill={zone ? zone.color : "#ffffff"}
                    stroke={isHighlight ? "#059669" : "#e2e8f0"} strokeWidth={isHighlight ? 2 : 0.5}
                    onMouseDown={() => startCell(x, y)}
                    onMouseEnter={() => painting && paintCell(x, y, erasing)}>
                    <title>{zone?.label || ""}</title>
                  </rect>
                );
              })
            )}

            {zones.map((z) => {
              const c = (z.cells || [])[0];
              if (!c) return null;
              return (
                <text key={z.id} x={c.x * CELL + 3} y={c.y * CELL + 11} fontSize="8" fill="#0f172a" opacity="0.7" pointerEvents="none">
                  {z.label}
                </text>
              );
            })}

            {pin && (
              <g transform={`translate(${pin.x * CELL + CELL / 2} ${pin.y * CELL + CELL / 2})`} pointerEvents="none">
                <circle r={CELL * 0.9} fill="#10b981" opacity="0.25">
                  <animate attributeName="r" values={`${CELL * 0.5};${CELL * 1.2};${CELL * 0.5}`} dur="1.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.35;0;0.35" dur="1.4s" repeatCount="indefinite" />
                </circle>
                <circle r="6" fill="#059669" stroke="#ffffff" strokeWidth="2" />
              </g>
            )}
          </g>
        </svg>
      </div>

      <div className="flex flex-wrap gap-3">
        {zones.map((z) => (
          <span key={z.id} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: z.color }} /> {z.label}
          </span>
        ))}
      </div>
    </div>
  );
}