import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = [
  "Receita de Vendas", "Fornecedores", "Aluguel", "Salários", "Impostos",
  "Energia/Água", "Marketing", "Manutenção", "Outros",
];

export default function EntryForm({ defaultType, onSave, onCancel }) {
  const [f, setF] = useState({
    type: defaultType || "receber", description: "", amount: "",
    due_date: "", category: "Outros", related_party: "", status: "pendente",
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...f, amount: Number(f.amount) };
    if (!data.due_date) delete data.due_date;
    await onSave(data);
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Tipo</Label>
          <Select value={f.type} onValueChange={(v) => setF({ ...f, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="receber">A Receber</SelectItem>
              <SelectItem value="pagar">A Pagar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Categoria (plano de contas)</Label>
          <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-slate-500">Descrição *</Label>
        <Input required value={f.description} onChange={set("description")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Valor (R$) *</Label>
          <Input required type="number" step="0.01" min="0" value={f.amount} onChange={set("amount")} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Vencimento</Label>
          <Input type="date" value={f.due_date} onChange={set("due_date")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-slate-500">Cliente / Fornecedor</Label>
        <Input value={f.related_party} onChange={set("related_party")} />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
          {saving ? "Salvando…" : "Salvar lançamento"}
        </Button>
      </div>
    </form>
  );
}