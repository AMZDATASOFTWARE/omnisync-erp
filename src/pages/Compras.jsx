import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Truck, PackagePlus } from "lucide-react";
import { brl } from "@/lib/format";
import { format } from "date-fns";
import SupplierForm from "@/components/compras/SupplierForm";
import PurchaseForm from "@/components/compras/PurchaseForm";
import { useToast } from "@/components/ui/use-toast";

export default function Compras() {
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supOpen, setSupOpen] = useState(false);
  const [purOpen, setPurOpen] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    const [s, p, pr] = await Promise.all([
      base44.entities.Supplier.list("-updated_date", 200),
      base44.entities.Purchase.list("-created_date", 100),
      base44.entities.Product.list("name", 500),
    ]);
    setSuppliers(s); setPurchases(p); setProducts(pr); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const saveSupplier = async (data) => { await base44.entities.Supplier.create(data); setSupOpen(false); load(); };

  const savePurchase = async (data) => {
    const purchase = await base44.entities.Purchase.create(data);
    // entrada de estoque + atualização de custo
    await Promise.all(data.items.map((i) => {
      const p = products.find((x) => x.id === i.product_id);
      return base44.entities.Product.update(i.product_id, {
        stock_quantity: (p?.stock_quantity || 0) + i.quantity,
        cost_price: i.cost,
      });
    }));
    // conta a pagar no financeiro
    await base44.entities.FinancialEntry.create({
      type: "pagar",
      description: `Compra ${data.invoice_number ? `NF ${data.invoice_number}` : purchase.id.slice(-6)} — ${data.supplier_name}`,
      amount: data.total,
      due_date: data.due_date,
      status: "pendente",
      category: "Fornecedores",
      related_party: data.supplier_name,
    });
    setPurOpen(false);
    toast({ title: "Mercadoria recebida", description: "Estoque atualizado e conta a pagar gerada." });
    load();
  };

  return (
    <div className="p-6 md:p-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Compras & Fornecedores</h1>
          <p className="text-sm text-slate-500 mt-1">Entrada de mercadoria conectada ao estoque e ao contas a pagar.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSupOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> Fornecedor</Button>
          <Button onClick={() => setPurOpen(true)} className="bg-emerald-600 hover:bg-emerald-700" disabled={suppliers.length === 0}>
            <PackagePlus className="w-4 h-4 mr-1.5" /> Nova compra
          </Button>
        </div>
      </div>

      {loading ? <p className="text-sm text-slate-400">Carregando…</p> : (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Fornecedor</th>
                  <th className="px-4 py-3 font-medium">Itens</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50">
                    <td className="px-4 py-3 text-slate-600">{format(new Date(c.created_date), "dd/MM/yyyy")}</td>
                    <td className="px-4 py-3">
                      <p className="text-slate-800">{c.supplier_name}</p>
                      <p className="text-[11px] text-slate-400">{c.invoice_number ? `NF ${c.invoice_number}` : "sem nota"}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {(c.items || []).map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">{brl(c.total)}</td>
                  </tr>
                ))}
                {purchases.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Nenhuma compra registrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-2 h-fit">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Truck className="w-4 h-4" /> Fornecedores</h2>
            {suppliers.length === 0 && <p className="text-xs text-slate-400">Cadastre um fornecedor para lançar compras.</p>}
            {suppliers.map((s) => (
              <div key={s.id} className="py-2 border-b border-slate-50 last:border-0">
                <p className="text-sm text-slate-800">{s.name}</p>
                <p className="text-[11px] text-slate-400">{s.category || "—"} · {s.phone || s.email || ""}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={supOpen} onOpenChange={setSupOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novo fornecedor</DialogTitle></DialogHeader>
          <SupplierForm onSave={saveSupplier} onCancel={() => setSupOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={purOpen} onOpenChange={setPurOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Entrada de mercadoria</DialogTitle></DialogHeader>
          <PurchaseForm suppliers={suppliers} products={products} onSave={savePurchase} onCancel={() => setPurOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}