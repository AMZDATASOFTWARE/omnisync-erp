import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { brl } from "@/lib/format";
import ClienteForm from "@/components/clientes/ClienteForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Clientes() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setCustomers(await base44.entities.Customer.list("-updated_date", 500));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (data) => {
    if (editing?.id) await base44.entities.Customer.update(editing.id, data);
    else await base44.entities.Customer.create(data);
    setOpen(false); setEditing(null);
    load();
  };

  const remove = async (c) => { await base44.entities.Customer.delete(c.id); load(); };

  const q = search.toLowerCase();
  const filtered = customers.filter((c) =>
    [c.name, c.email, c.phone, c.cpf_cnpj, ...(c.tags || [])].some((f) => (f || "").toLowerCase().includes(q))
  );

  return (
    <div className="p-6 md:p-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Clientes & Marketing</h1>
          <p className="text-sm text-slate-500 mt-1">Base unificada — histórico de consumo conectado ao PDV e financeiro.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-1.5" /> Novo cliente
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, tag, telefone…" className="pl-9 bg-white" />
      </div>

      {loading ? <p className="text-sm text-slate-400">Carregando clientes…</p> : (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Tags</th>
                <th className="px-4 py-3 font-medium text-right">Total consumido</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.cpf_cnpj || ""}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{c.phone || "—"}<br />{c.email || ""}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(c.tags || []).map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-700">{t}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-800">{brl(c.total_spent)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => remove(c)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Nenhum cliente encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar cliente" : "Novo cliente"}</DialogTitle></DialogHeader>
          <ClienteForm customer={editing} onSave={save} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}