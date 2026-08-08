import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const TYPES = [
  { id: "gondola", label: "Gôndola" },
  { id: "prateleira", label: "Prateleira" },
  { id: "geladeira", label: "Geladeira" },
  { id: "caixa", label: "Caixa" },
  { id: "deposito", label: "Depósito" },
  { id: "entrada", label: "Entrada" },
  { id: "outro", label: "Outro" },
];
const COLORS = ["#34d399", "#60a5fa", "#f59e0b", "#f472b6", "#a78bfa", "#f87171", "#2dd4bf", "#fb923c", "#94a3b8"];

export default function ZonePanel({ map, products, selectedZoneId, onSelect, onChange }) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState("gondola");
  const zones = map.zones || [];

  const addZone = () => {
    if (!label.trim()) return;
    const zone = {
      id: `z_${Date.now()}`,
      label: label.trim(),
      type,
      color: COLORS[zones.length % COLORS.length],
      cells: [],
    };
    onChange({ ...map, zones: [...zones, zone] });
    onSelect(zone.id);
    setLabel("");
  };

  const removeZone = (id) => {
    onChange({ ...map, zones: zones.filter((z) => z.id !== id) });
    if (selectedZoneId === id) onSelect(null);
  };

  const productCount = (id) => products.filter((p) => p.map_zone_id === id).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-4 h-fit">
      <h2 className="text-sm font-semibold text-slate-700">Zonas da planta</h2>

      <div className="space-y-2">
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Nome da zona (ex: Gôndola 2)"
          onKeyDown={(e) => e.key === "Enter" && addZone()} />
        <div className="flex gap-2">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
            <SelectContent>{TYPES.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={addZone} className="bg-emerald-600 hover:bg-emerald-700 shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        {zones.length === 0 && <p className="text-xs text-slate-400">Crie uma zona e depois pinte as células no grid.</p>}
        {zones.map((z) => (
          <div key={z.id} onClick={() => onSelect(z.id === selectedZoneId ? null : z.id)}
            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-colors ${
              selectedZoneId === z.id ? "border-emerald-400 bg-emerald-50" : "border-transparent hover:bg-slate-50"
            }`}>
            <span className="w-3.5 h-3.5 rounded-sm shrink-0" style={{ backgroundColor: z.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-800 truncate">{z.label}</p>
              <p className="text-[11px] text-slate-400">{TYPES.find((t) => t.id === z.type)?.label} · {productCount(z.id)} produto(s)</p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-400"
              onClick={(e) => { e.stopPropagation(); removeZone(z.id); }}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
      {selectedZoneId && (
        <p className="text-[11px] text-emerald-600 bg-emerald-50 rounded-lg p-2">
          Zona selecionada — clique/arraste no grid para pintar. Clicar em célula já pintada apaga.
        </p>
      )}
    </div>
  );
}