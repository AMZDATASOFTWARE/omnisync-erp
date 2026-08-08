import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Link2, X } from "lucide-react";

export default function ProductLinker({ products, zone, shelves = [], onLink, onUnlink, onHighlight }) {
  const [q, setQ] = useState("");
  const [shelfId, setShelfId] = useState("");
  const [level, setLevel] = useState("");
  const query = q.toLowerCase().trim();
  const shelf = shelves.find((s) => s.id === shelfId) || null;

  const results = query
    ? products.filter((p) => [p.name, p.sku, p.barcode].some((f) => (f || "").toLowerCase().includes(query))).slice(0, 8)
    : [];
  const linked = zone ? products.filter((p) => (p.zone_id || p.map_zone_id) === zone.id) : [];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3 h-fit">
      <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <Link2 className="w-4 h-4" /> Vincular produtos
      </h2>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar SKU, EAN ou nome…" className="pl-9" />
      </div>

      {zone && shelves.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <select value={shelfId} onChange={(e) => { setShelfId(e.target.value); setLevel(""); }}
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm text-slate-700">
            <option value="">Sem gôndola</option>
            {shelves.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <select value={level} onChange={(e) => setLevel(e.target.value)} disabled={!shelf}
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm text-slate-700 disabled:opacity-50">
            <option value="">Nível</option>
            {[...Array(shelf?.levels || 0)].map((_, i) => <option key={i} value={i + 1}>{i + 1}º nível</option>)}
          </select>
        </div>
      )}

      {results.length > 0 && (
        <div className="border border-slate-100 rounded-lg divide-y max-h-56 overflow-y-auto">
          {results.map((p) => (
            <div key={p.id} className="p-2 flex items-center gap-2 hover:bg-slate-50">
              <button className="flex-1 text-left min-w-0" onClick={() => onHighlight(p)}>
                <p className="text-sm text-slate-800 truncate">{p.name}</p>
                <p className="text-[11px] text-slate-400">{p.sku || p.barcode || "sem código"}</p>
              </button>
              {zone && (
                <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={() => onLink(p, zone, shelf, level ? Number(level) : null)}>
                  <MapPin className="w-3 h-3 mr-1" /> Alocar
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {!zone && <p className="text-xs text-slate-400">Selecione uma zona para alocar produtos.</p>}

      {zone && (
        <div className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Alocados em {zone.label} ({linked.length})</p>
          {linked.length === 0 && <p className="text-xs text-slate-400">Nenhum produto nesta zona.</p>}
          {linked.map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-sm py-1">
              <button className="flex-1 text-left truncate text-slate-700 hover:text-emerald-600" onClick={() => onHighlight(p)}>
                {p.name}
                {p.shelf_identifier && (
                  <span className="text-[11px] text-slate-400 ml-1.5">
                    {p.shelf_identifier}{p.pos_z ? ` · ${p.pos_z}º nível` : ""}
                  </span>
                )}
              </button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-400" onClick={() => onUnlink(p)}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}