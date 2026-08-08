import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { FileSignature } from "lucide-react";
import ServiceInvoiceForm from "@/components/nfse/ServiceInvoiceForm";
import ServiceInvoiceTable from "@/components/nfse/ServiceInvoiceTable";
import CancelDialog from "@/components/fiscal/CancelDialog";
import { withStore, ofStore } from "@/lib/scope";

export default function NFSe() {
  const [invoices, setInvoices] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emittingId, setEmittingId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    const [list, configs] = await Promise.all([
      base44.entities.ServiceInvoice.list("-created_date", 100),
      base44.entities.FiscalConfig.list("-created_date", 1),
    ]);
    setInvoices(ofStore(list));
    setConfig(configs[0] || {});
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async (form) => {
    await base44.entities.ServiceInvoice.create(withStore(form));
    toast({ title: "NFS-e salva como rascunho" });
    await load();
  };

  const emit = async (invoice) => {
    setEmittingId(invoice.id);
    const res = await base44.functions.invoke("emitNFSe", { invoice_id: invoice.id });
    const data = res.data || {};
    toast({
      title: data.success ? "NFS-e emitida" : "Não foi possível emitir",
      description: data.message,
      variant: data.success ? undefined : "destructive",
    });
    setEmittingId(null);
    await load();
  };

  const cancel = async (motivo) => {
    const res = await base44.functions.invoke("cancelNFSe", { invoice_id: cancelTarget.id, motivo });
    const data = res.data || {};
    toast({
      title: data.success ? "NFS-e cancelada" : "Não foi possível cancelar",
      description: data.message,
      variant: data.success ? undefined : "destructive",
    });
    await load();
  };

  const remove = async (invoice) => {
    await base44.entities.ServiceInvoice.delete(invoice.id);
    await load();
  };

  return (
    <div className="p-5 md:p-8 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <FileSignature className="w-5 h-5 text-primary" /> NFS-e — Padrão Nacional
        </h1>
        <p className="text-sm text-muted-foreground">
          Integração direta com a API gratuita do governo (Sefin Nacional) · ambiente{" "}
          {config?.nfse_ambiente === "producao" ? "produção" : "produção restrita"}. Configure município IBGE,
          inscrição municipal e alíquota de ISS na tela Fiscal.
        </p>
      </div>

      {config && <ServiceInvoiceForm config={config} onSubmit={create} />}

      {loading ? (
        <p className="text-sm text-muted-foreground py-10 text-center">Carregando…</p>
      ) : (
        <ServiceInvoiceTable invoices={invoices} emittingId={emittingId} onEmit={emit}
          onCancel={setCancelTarget} onDelete={remove} />
      )}

      <CancelDialog open={!!cancelTarget} onOpenChange={(v) => !v && setCancelTarget(null)}
        title="Cancelar NFS-e" onConfirm={cancel} />
    </div>
  );
}