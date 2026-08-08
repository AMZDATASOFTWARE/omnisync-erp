import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import TaxRuleForm from "@/components/fiscal/TaxRuleForm";
import TaxRuleTable from "@/components/fiscal/TaxRuleTable";

export default function Tributacao() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const list = await base44.entities.TaxRule.list("ncm", 500);
    setRules(list);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (data) => {
    if (editing) await base44.entities.TaxRule.update(editing.id, data);
    else await base44.entities.TaxRule.create(data);
    setOpen(false);
    setEditing(null);
    load();
  };

  const remove = async (rule) => {
    await base44.entities.TaxRule.delete(rule.id);
    setRules((rs) => rs.filter((r) => r.id !== rule.id));
  };

  const startEdit = (rule) => { setEditing(rule); setOpen(true); };

  return (
    <div className="p-6 md:p-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tributação por NCM</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Regras de CFOP, CSOSN/CST e alíquotas por NCM e UF. A emissão resolve nesta ordem: regra do NCM+UF → regra do NCM → padrão do regime.
          </p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4" /> Nova regra</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar regra" : "Nova regra tributária"}</DialogTitle></DialogHeader>
            <TaxRuleForm rule={editing} onSave={save} onCancel={() => { setOpen(false); setEditing(null); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl">
        {loading ? <p className="p-6 text-sm text-muted-foreground">Carregando regras…</p>
          : <TaxRuleTable rules={rules} onEdit={startEdit} onDelete={remove} />}
      </div>
    </div>
  );
}