import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FiscalConfigCard({ config, onSave }) {
  const [form, setForm] = useState({ regime: "simples_nacional", uf: "CE", ...config });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border p-5 grid gap-4 md:grid-cols-3">
      <div className="md:col-span-3">
        <p className="font-medium text-sm">Dados do emitente</p>
        <p className="text-xs text-muted-foreground">Usados em todo documento fiscal emitido.</p>
      </div>
      <div className="space-y-1.5">
        <Label>Razão social</Label>
        <Input value={form.razao_social || ""} onChange={(e) => set("razao_social", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>CNPJ</Label>
        <Input value={form.cnpj || ""} onChange={(e) => set("cnpj", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Inscrição estadual</Label>
        <Input value={form.inscricao_estadual || ""} onChange={(e) => set("inscricao_estadual", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>UF</Label>
        <Input maxLength={2} value={form.uf || ""} onChange={(e) => set("uf", e.target.value.toUpperCase())} />
      </div>
      <div className="space-y-1.5">
        <Label>Regime tributário</Label>
        <Select value={form.regime} onValueChange={(v) => set("regime", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
            <SelectItem value="regime_normal">Regime Normal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar configurações"}</Button>
      </div>
    </form>
  );
}