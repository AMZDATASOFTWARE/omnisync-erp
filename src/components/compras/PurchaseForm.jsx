import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { brl } from "@/lib/format";

export default function PurchaseForm({ suppliers, products, onSave, onCancel }) {
  const [supplierId, setSupplierId] = useState("");
  const [invoice, setInvoice] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState([]);
  const [pick, setPick] = useState("");

  const addItem = () => {
    const p = products.find((x) => x.id === pick);
    if (!p || items.some((i) => i.product_id === p.id)) return;
    setItems([...items, { product_id: p.id, name: p.name, quantity: 1, cost: p.cost_price || 0 }]);
    setPick("");
  };

  const update = (id, k, v) => setItems(items.map((i) => (i.product_id === id ? { ...i, [k]: Number(v) || 0 } : i)));
  const total = items.reduce((a, i) => a + i.quantity * i.cost, 0);
  const supplier = suppliers.find((s) => s.id === supplierId);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Fornecedor</Label>
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Nº da nota</Label><Input value={invoice} onChange={(e) => setInvoice(e.target.value)} /></div>
        <div><Label>Vencimento</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
      </div>

      <div className="flex gap-2">
        <Select value={pick} onValueChange={setPick}>
          <SelectTrigger className="flex-1"><SelectValue placeholder="Adicionar produto ao pedido" /></SelectTrigger>
          <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
        </Select>
        <Button type="button" onClick={addItem} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4" /></Button>
      </div>

      <div className="divide-y max-h-64 overflow-y-auto">
        {items.length === 0 && <p className="text-xs text-slate-400 py-3">Nenhum item — adicione produtos para dar entrada no estoque.</p>}
        {items.map((i) => (
          <div key={i.product_id} className="py-2 flex items-center gap-2">
            <p className="flex-1 text-sm text-slate-800 truncate">{i.name}</p>
            <Input type="number" min="0" className="w-20" value={i.quantity} onChange={(e) => update(i.product_id, "quantity", e.target.value)} />
            <Input type="number" min="0" step="0.01" className="w-24" value={i.cost} onChange={(e) => update(i.product_id, "cost", e.target.value)} />
            <Button variant="ghost" size="icon" className="text-rose-500 h-8 w-8"
              onClick={() => setItems(items.filter((x) => x.product_id !== i.product_id))}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <p className="text-sm text-slate-500">Total da compra</p>
        <p className="text-lg font-semibold text-slate-900">{brl(total)}</p>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button disabled={!supplier || items.length === 0} className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => onSave({
            supplier_id: supplier.id, supplier_name: supplier.name, invoice_number: invoice,
            items, total, due_date: dueDate || undefined, status: "recebida",
          })}>
          Receber mercadoria
        </Button>
      </div>
    </div>
  );
}