import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Field = ({ label, children, className = "" }) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label className="text-xs text-slate-500">{label}</Label>
    {children}
  </div>
);

export default function ProductLocationFields({ f, set, setF, map }) {
  const shelves = (map?.shelves || []).filter((s) => !f.zone_id || s.zone_id === f.zone_id);

  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Zona no mapa da loja">
        <Select value={f.zone_id || "none"} onValueChange={(v) => setF({ ...f, zone_id: v === "none" ? "" : v })}>
          <SelectTrigger><SelectValue placeholder="Selecionar zona" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem localização</SelectItem>
            {(map?.zones || []).map((z) => <SelectItem key={z.id} value={z.id}>{z.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Gôndola / estante">
        <Input value={f.shelf_identifier} onChange={set("shelf_identifier")} placeholder={shelves[0]?.label || "Gôndola B"} />
      </Field>
      <Field label="Posição X (0–1)"><Input type="number" step="0.01" min="0" max="1" value={f.pos_x} onChange={set("pos_x")} /></Field>
      <Field label="Posição Y (0–1)"><Input type="number" step="0.01" min="0" max="1" value={f.pos_y} onChange={set("pos_y")} /></Field>
      <Field label="Nível da prateleira (Z)" className="col-span-2">
        <Input type="number" step="1" min="0" value={f.pos_z} onChange={set("pos_z")} placeholder="0 = piso" />
      </Field>
    </div>
  );
}