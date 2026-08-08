import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, CheckCircle2, Trash2 } from "lucide-react";
import { brl } from "@/lib/format";
import EntryForm from "@/components/financeiro/EntryForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { withStore, ofStore } from "@/lib/scope";

const statusStyle = {
  pendente: "border-amber-300 bg-amber-50 text-amber-700",
  pago: "border-emerald-300 bg-emerald-50 text-emerald-700",
  vencido: "border-rose-300 bg-rose-50 text-rose-700",
};

export default function Financeiro() {
  const [entries, setEntries] = useState([]);
  const [tab, setTab] = useState("receber");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setEntries(ofStore(await base44.entities.FinancialEntry.list("-created_date", 500)));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (data) => {
    await base44.entities.FinancialEntry.create(withStore(data));
    setOpen(false);
    load();
  };
  const markPaid = async (e) => { await base44.entities.FinancialEntry.update(e.id, { status: "pago" }); load(); };
  const remove = async (e) => { await base44.entities.FinancialEntry.delete(e.id); load(); };

  const list = entries.filter((e) => e.type === tab);
  const pending = list.filter((e) => e.status !== "pago").reduce((a, e) => a + (e.amount || 0), 0);
  const received = entries.filter((e) => e.type === "receber" && e.status === "pago").reduce((a, e) => a + e.amount, 0);
  const paid = entries.filter((e) => e.type === "pagar" && e.status === "pago").reduce((a, e) => a + e.amount, 0);

  return (
    <div className="p-6 md:p-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Financeiro</h1>
          <p className="text-sm text-slate-500 mt-1">Contas a pagar e receber — vendas do PDV entram aqui automaticamente.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-1.5" /> Novo lançamento
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-2xl">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4">
          <p className="text-xs text-slate-400">Resultado (DRE simplificado)</p>
          <p className={`text-lg font-semibold ${received - paid >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{brl(received - paid)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4">
          <p className="text-xs text-slate-400">A {tab} pendente</p>
          <p className="text-lg font-semibold text-slate-900">{brl(pending)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4">
          <p className="text-xs text-slate-400">Lançamentos</p>
          <p className="text-lg font-semibold text-slate-900">{list.length}</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="receber">Contas a Receber</TabsTrigger>
          <TabsTrigger value="pagar">Contas a Pagar</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? <p className="text-sm text-slate-400">Carregando…</p> : (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Vencimento</th>
                <th className="px-4 py-3 font-medium text-right">Valor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{e.description}</p>
                    <p className="text-xs text-slate-400">{e.related_party || ""}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{e.category || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{e.due_date ? format(new Date(e.due_date + "T12:00:00"), "dd/MM/yyyy") : "—"}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-800">{brl(e.amount)}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className={statusStyle[e.status] || ""}>{e.status}</Badge></td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {e.status !== "pago" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" title="Marcar como pago" onClick={() => markPaid(e)}>
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => remove(e)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Nenhum lançamento nesta aba.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Novo lançamento</DialogTitle></DialogHeader>
          <EntryForm defaultType={tab} onSave={save} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}