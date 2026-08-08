import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Rows3, Plus, X } from "lucide-react";

const num = (v, d) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : d);

export default function ShelfPanel({ map, zone, onChange, selectedShelfId, onSelectShelf }) {
  const [form, setForm] = useState({ label: "", width: 2, height: 1, levels: 3 });
  const shelves = map.shelves || [];
  const zoneShelves = zone ? shelves.filter((s) => s.zone_id === zone.id) : [];

  if (!zone) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-4">
        <p className="text-xs text-slate-400">Selecione uma zona para gerenciar gôndolas.</p>
      </div>
    );
  }

  const add = () => {
    const label = form.label.trim() || `Gôndola ${zoneShelves.length + 1}`;
    const base = (zone.cells || [])[0] || { x: 0, y: 0 };
    const shelf = {
      id: `sh_${Date.now()}`,
      zone_id: zone.id,
      label,
      x: base.x,
      y: base.y,
      width: num(form.width, 2),
      height: num(form.height, 1),
      levels: num(form.levels, 3),
      orientation: num(form.width, 2) >= num(form.height, 1) ? "horizontal" : "vertical",
    };
    onChange({ ...map, shelves: [...shelves, shelf] });
    onSelectShelf?.(shelf.id);
    setForm({ label: "", width: 2, height: 1, levels: 3 });
  };

  const remove = (id) => {
    onChange({ ...map, shelves: shelves.filter((s) => s.id !== id) });
    if (selectedShelfId === id) onSelectShelf?.(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3 h-fit">
      <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <Rows3 className="w-4 h-4" /> Gôndolas de {zone.label}
      </h2>

      <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Nome da gôndola (ex: Gôndola B)" />
      <div className="grid grid-cols-3 gap-2">
        {[["width", "Largura"], ["height", "Altura"], ["levels", "Níveis"]].map(([k, l]) => (
          <div key={k}>
            <label className="text-[11px] text-slate-400">{l}</label>
            <Input type="number" min="1" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="h-8" />
          </div>
        ))}
      </div>
      <Button size="sm" className="w-full" onClick={add}><Plus className="w-3.5 h-3.5 mr-1" /> Adicionar gôndola</Button>

      <div className="space-y-1.5 pt-1">
        {zoneShelves.length === 0 && <p className="text-xs text-slate-400">Nenhuma gôndola nesta zona.</p>}
        {zoneShelves.map((s) => (
          <div key={s.id} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${selectedShelfId === s.id ? "bg-emerald-50" : "hover:bg-slate-50"}`}>
            <button className="flex-1 text-left" onClick={() => onSelectShelf?.(s.id)}>
              <p className="text-sm text-slate-800">{s.label}</p>
              <p className="text-[11px] text-slate-400">{s.width}×{s.height} · {s.levels} níveis</p>
            </button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-400" onClick={() => remove(s.id)}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {selectedShelfId && <p className="text-[11px] text-slate-400">Use a ferramenta “Gôndola” no mapa para reposicionar a gôndola selecionada.</p>}
    </div>
  );
}