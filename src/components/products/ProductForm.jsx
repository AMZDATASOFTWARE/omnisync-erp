import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductFiscalFields from "./ProductFiscalFields";
import ProductLocationFields from "./ProductLocationFields";

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
    stock_min: product?.stock_min ?? product?.min_stock ?? 0,
    stock_max: product?.stock_max ?? "",
    track_batch: product?.track_batch ?? false,
    ncm: product?.ncm || "",
    cest: product?.cest || "",
    cfop_default: product?.cfop_default || "",
    tax_origin: String(product?.tax_origin ?? 0),
    lot: product?.lot || "",
    expiry_date: product?.expiry_date || "",
    zone_id: product?.zone_id || product?.map_zone_id || "",
    shelf_identifier: product?.shelf_identifier || product?.shelf_label || "",
    pos_x: product?.pos_x ?? "",
    pos_y: product?.pos_y ?? "",
    pos_z: product?.pos_z ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const num = (v) => (v === "" || v === null ? undefined : Number(v));
    const data = {
      ...f,
      price: Number(f.price),
      cost_price: Number(f.cost_price) || 0,
      stock_quantity: Number(f.stock_quantity) || 0,
      stock_min: Number(f.stock_min) || 0,
      min_stock: Number(f.stock_min) || 0, // compatibilidade com dados existentes
      stock_max: num(f.stock_max),
      tax_origin: Number(f.tax_origin) || 0,
      pos_x: num(f.pos_x), pos_y: num(f.pos_y), pos_z: num(f.pos_z),
      map_zone_id: f.zone_id,
      shelf_label: f.shelf_identifier,
    };
    Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
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
        <Field label="Estoque mínimo (alerta)"><Input type="number" step="0.01" value={f.stock_min} onChange={set("stock_min")} /></Field>
        <Field label="Estoque máximo"><Input type="number" step="0.01" value={f.stock_max} onChange={set("stock_max")} /></Field>
        <Field label="Rastrear lote/validade">
          <label className="flex items-center gap-2 h-9 text-sm text-slate-600">
            <input type="checkbox" className="w-4 h-4 accent-emerald-600"
              checked={f.track_batch} onChange={(e) => setF({ ...f, track_batch: e.target.checked })} />
            Ativar rastreio
          </label>
        </Field>
        {f.track_batch && <>
          <Field label="Lote"><Input value={f.lot} onChange={set("lot")} /></Field>
          <Field label="Validade"><Input type="date" value={f.expiry_date} onChange={set("expiry_date")} /></Field>
        </>}
      </div>

      <div className="pt-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Fiscal</p>
        <ProductFiscalFields f={f} set={set} setF={setF} />
      </div>

      <div className="pt-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Localização física</p>
        <ProductLocationFields f={f} set={set} setF={setF} map={map} />
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