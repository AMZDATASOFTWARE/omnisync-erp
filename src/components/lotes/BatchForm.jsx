import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

const EMPTY = { product_id: "", lot_code: "", expiry_date: "", quantity: "", cost: "" };

export default function BatchForm({ products, onCreate }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const product = products.find((p) => p.id === form.product_id);
    if (!product || !form.quantity) return;
    setSaving(true);
    await onCreate({
      product_id: product.id,
      product_name: product.name,
      sku: product.sku || "",
      lot_code: form.lot_code,
      expiry_date: form.expiry_date || undefined,
      quantity: Number(form.quantity),
      initial_quantity: Number(form.quantity),
      cost: form.cost ? Number(form.cost) : undefined,
      zone_id: product.zone_id || product.map_zone_id || "",
      shelf_label: product.shelf_identifier || "",
      status: "ativo",
    });
    setForm(EMPTY);
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3">
      <h2 className="text-sm font-semibold text-slate-900">Novo lote</h2>
      <div>
        <Label className="text-xs text-slate-500">Produto</Label>
        <select className="w-full h-9 mt-1 rounded-md border border-input bg-transparent px-3 text-sm"
          value={form.product_id} onChange={(e) => set("product_id", e.target.value)} required>
          <option value="">Selecione…</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-slate-500">Lote</Label>
          <Input className="mt-1" value={form.lot_code} onChange={(e) => set("lot_code", e.target.value)} placeholder="L-2026-01" />
        </div>
        <div>
          <Label className="text-xs text-slate-500">Validade</Label>
          <Input className="mt-1" type="date" value={form.expiry_date} onChange={(e) => set("expiry_date", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs text-slate-500">Quantidade</Label>
          <Input className="mt-1" type="number" min="0" step="any" value={form.quantity}
            onChange={(e) => set("quantity", e.target.value)} required />
        </div>
        <div>
          <Label className="text-xs text-slate-500">Custo un.</Label>
          <Input className="mt-1" type="number" min="0" step="any" value={form.cost} onChange={(e) => set("cost", e.target.value)} />
        </div>
      </div>
      <Button type="submit" disabled={saving} className="w-full">
        <Plus className="w-4 h-4" /> {saving ? "Salvando…" : "Registrar lote"}
      </Button>
    </form>
  );
}