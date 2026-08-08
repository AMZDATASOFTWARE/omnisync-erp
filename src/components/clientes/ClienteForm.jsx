import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ClienteForm({ customer, onSave, onCancel }) {
  const [f, setF] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    cpf_cnpj: customer?.cpf_cnpj || "",
    tags: (customer?.tags || []).join(", "),
    notes: customer?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...f,
      tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-slate-500">Nome *</Label>
        <Input required value={f.name} onChange={set("name")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Telefone / WhatsApp</Label>
          <Input value={f.phone} onChange={set("phone")} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">CPF / CNPJ</Label>
          <Input value={f.cpf_cnpj} onChange={set("cpf_cnpj")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-slate-500">E-mail</Label>
        <Input type="email" value={f.email} onChange={set("email")} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-slate-500">Tags de segmentação (separadas por vírgula)</Label>
        <Input value={f.tags} onChange={set("tags")} placeholder="vip, pet shop, atacado" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-slate-500">Observações</Label>
        <Textarea value={f.notes} onChange={set("notes")} rows={2} />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
          {saving ? "Salvando…" : "Salvar cliente"}
        </Button>
      </div>
    </form>
  );
}