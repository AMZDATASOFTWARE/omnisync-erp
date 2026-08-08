import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/format";
import { Minus, Plus, X, Receipt, Banknote, CreditCard, QrCode } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const METHODS = [
  { id: "dinheiro", label: "Dinheiro", icon: Banknote },
  { id: "pix", label: "Pix", icon: QrCode },
  { id: "credito", label: "Crédito", icon: CreditCard },
  { id: "debito", label: "Débito", icon: CreditCard },
];

export default function Cart({ cart, setCart, onFinish }) {
  const [method, setMethod] = useState("dinheiro");
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { base44.entities.Customer.list("name", 200).then(setCustomers); }, []);

  const total = cart.reduce((a, i) => a + i.price * i.quantity, 0);
  const changeQty = (id, d) =>
    setCart((c) => c.map((i) => i.product_id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i));
  const removeItem = (id) => setCart((c) => c.filter((i) => i.product_id !== id));

  const finish = async () => {
    setSaving(true);
    const customer = customers.find((c) => c.id === customerId);
    await onFinish({ payment_method: method, customer });
    setSaving(false); setDone(true); setCustomerId("");
    setTimeout(() => setDone(false), 2500);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 lg:sticky lg:top-6">
      <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <Receipt className="w-4 h-4 text-emerald-500" /> Cupom atual
      </h2>

      {cart.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">
          {done ? "✓ Venda concluída! Estoque e financeiro atualizados." : "Adicione produtos para iniciar a venda."}
        </p>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {cart.map((i) => (
            <li key={i.product_id} className="flex items-center gap-2 text-sm">
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 truncate">{i.name}</p>
                <p className="text-xs text-slate-400">{brl(i.price)} × {i.quantity}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => changeQty(i.product_id, -1)}><Minus className="w-3 h-3" /></Button>
                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => changeQty(i.product_id, 1)}><Plus className="w-3 h-3" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-500" onClick={() => removeItem(i.product_id)}><X className="w-3 h-3" /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Select value={customerId || "none"} onValueChange={(v) => setCustomerId(v === "none" ? "" : v)}>
        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Cliente" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Consumidor final</SelectItem>
          {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="grid grid-cols-4 gap-1.5">
        {METHODS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setMethod(id)}
            className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-[11px] transition-colors ${
              method === id ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-sm text-slate-500">Total</span>
        <span className="text-2xl font-semibold text-slate-900 tracking-tight">{brl(total)}</span>
      </div>

      <Button onClick={finish} disabled={cart.length === 0 || saving}
        className="h-11 bg-emerald-600 hover:bg-emerald-700 text-base">
        {saving ? "Processando…" : "Finalizar venda (F2)"}
      </Button>
      <p className="text-[11px] text-slate-400 text-center">
        Emissão de NFC-e/SAT: estrutura pronta — venda marcada como "fiscal pendente" para integração futura.
      </p>
    </div>
  );
}