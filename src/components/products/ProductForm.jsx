import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const UNITS = ["un", "kg", "g", "l", "ml", "m", "m2", "cx", "pct"];

const Field = ({ label, children, className = "" }) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label className="text-xs text-slate-500">{label}</Label>
    {children}
  </div>
);

export default function ProductForm({ product, map, onSave, onCancel }) {
  const [f, setF] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    category: product?.category || "",
    brand: product?.brand || "",
    unit: product?.unit || "un",
    price: product?.price ?? "",
    cost_price: product?.cost_price ?? "",
    stock_quantity: product?.stock_quantity ?? 0,
    min_stock: product?.min_stock ?? 0,
    ncm: product?.ncm || "",
    cest: product?.cest || "",
    lot: product?.lot || "",
    expiry_date: product?.expiry_date || "",
    map_zone_id: product?.map_zone_id || "",
    shelf_label: product?.shelf_label || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...f, price: Number(f.price), cost_price: Number(f.cost_price) || 0,
      stock_quantity: Number(f.stock_quantity) || 0, min_stock: Number(f.min_stock) || 0 };
    if (!data.expiry_date) delete data.expiry_date;
    await onSave(data);
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nome *" className="col-span-2">
          <Input required value={f.name} onChange={set("name")} placeholder="Ex: Chave Phillips 16mm Thompson" />
        </Field>
        <Field label="SKU"><Input value={f.sku} onChange={set("sku")} /></Field>
        <Field label="Código de barras (EAN)"><Input value={f.barcode} onChange={set("barcode")} /></Field>
        <Field label="Categoria"><Input value={f.category} onChange={set("category")} placeholder="Ferramentas" /></Field>
        <Field label="Marca"><Input value={f.brand} onChange={set("brand")} /></Field>
        <Field label="Preço de venda (R$) *"><Input required type="number" step="0.01" min="0" value={f.price} onChange={set("price")} /></Field>
        <Field label="Preço de custo (R$)"><Input type="number" step="0.01" min="0" value={f.cost_price} onChange={set("cost_price")} /></Field>
        <Field label="Unidade">
          <Select value={f.unit} onValueChange={(v) => setF({ ...f, unit: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Estoque atual"><Input type="number" step="0.01" value={f.stock_quantity} onChange={set("stock_quantity")} /></Field>
        <Field label="Estoque mínimo (alerta)"><Input type="number" step="0.01" value={f.min_stock} onChange={set("min_stock")} /></Field>
        <Field label="NCM"><Input value={f.ncm} onChange={set("ncm")} placeholder="8205.40.00" /></Field>
        <Field label="CEST"><Input value={f.cest} onChange={set("cest")} /></Field>
        <Field label="Lote"><Input value={f.lot} onChange={set("lot")} /></Field>
        <Field label="Validade"><Input type="date" value={f.expiry_date} onChange={set("expiry_date")} /></Field>
        <Field label="Zona no mapa da loja">
          <Select value={f.map_zone_id || "none"} onValueChange={(v) => setF({ ...f, map_zone_id: v === "none" ? "" : v })}>
            <SelectTrigger><SelectValue placeholder="Selecionar zona" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem localização</SelectItem>
              {(map?.zones || []).map((z) => <SelectItem key={z.id} value={z.id}>{z.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Prateleira / posição"><Input value={f.shelf_label} onChange={set("shelf_label")} placeholder="Prateleira 2" /></Field>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
          {saving ? "Salvando…" : "Salvar produto"}
        </Button>
      </div>
    </form>
  );
}