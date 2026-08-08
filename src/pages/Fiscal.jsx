import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import SaleFiscalRow from "@/components/fiscal/SaleFiscalRow";
import FiscalConfigCard from "@/components/fiscal/FiscalConfigCard";
import CancelDialog from "@/components/fiscal/CancelDialog";
import { Button } from "@/components/ui/button";
import { Receipt, RefreshCw } from "lucide-react";

export default function Fiscal() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emittingId, setEmittingId] = useState(null);
  const [config, setConfig] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [reprocessing, setReprocessing] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    const [data, configs] = await Promise.all([
      base44.entities.Sale.filter({ status: "concluida" }, "-created_date", 100),
      base44.entities.FiscalConfig.list("-created_date", 1),
    ]);
    setSales(data);
    setConfig(configs[0] || {});
    setLoading(false);
  };

  const saveConfig = async (form) => {
    const saved = config?.id
      ? await base44.entities.FiscalConfig.update(config.id, form)
      : await base44.entities.FiscalConfig.create(form);
    setConfig(saved);
    toast({ title: "Configurações fiscais salvas" });
  };

  useEffect(() => { load(); }, []);

  const handleEmit = async (sale) => {
    setEmittingId(sale.id);
    const res = await base44.functions.invoke("emitFiscalDocument", { sale_id: sale.id });
    const data = res.data || {};
    toast({
      title: data.success ? "Documento emitido" : "Não foi possível emitir",
      description: data.message,
      variant: data.success ? undefined : "destructive",
    });
    setEmittingId(null);
    await load();
  };

  const handleCancel = async (justificativa) => {
    const res = await base44.functions.invoke("cancelFiscalDocument", {
      sale_id: cancelTarget.id, justificativa,
    });
    const data = res.data || {};
    toast({
      title: data.success ? "Documento cancelado" : "Não foi possível cancelar",
      description: data.message,
      variant: data.success ? undefined : "destructive",
    });
    await load();
  };

  const handleReprocess = async () => {
    setReprocessing(true);
    const res = await base44.functions.invoke("reprocessFiscalQueue", {});
    toast({ title: "Fila reprocessada", description: res.data?.message });
    setReprocessing(false);
    await load();
  };

  const pendentes = sales.filter((s) => s.fiscal_status === "pendente").length;

  return (
    <div className="p-5 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" /> Fiscal — NFC-e
          </h1>
          <p className="text-sm text-muted-foreground">
            {pendentes} venda(s) aguardando emissão · ambiente de homologação (sandbox)
          </p>
        </div>
        <Button variant="outline" disabled={reprocessing || !pendentes} onClick={handleReprocess}>
          <RefreshCw className={`w-4 h-4 ${reprocessing ? "animate-spin" : ""}`} />
          {reprocessing ? "Reprocessando..." : "Reprocessar fila"}
        </Button>
      </div>

      {config && <FiscalConfigCard config={config} onSave={saveConfig} />}

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="py-3 px-4 font-medium">Data</th>
              <th className="py-3 px-4 font-medium">Cliente</th>
              <th className="py-3 px-4 font-medium">Itens</th>
              <th className="py-3 px-4 font-medium">Total</th>
              <th className="py-3 px-4 font-medium">Documento</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">Carregando...</td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">Nenhuma venda registrada ainda.</td></tr>
            ) : (
              sales.map((s) => (
                <SaleFiscalRow key={s.id} sale={s} emitting={emittingId === s.id} onEmit={handleEmit}
                  onCancel={setCancelTarget} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <CancelDialog open={!!cancelTarget} onOpenChange={(v) => !v && setCancelTarget(null)}
        title="Cancelar NFC-e" onConfirm={handleCancel} />
    </div>
  );
}