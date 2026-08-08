import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import SaleFiscalRow from "@/components/fiscal/SaleFiscalRow";
import { Receipt } from "lucide-react";

export default function Fiscal() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emittingId, setEmittingId] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    const data = await base44.entities.Sale.filter({ status: "concluida" }, "-created_date", 100);
    setSales(data);
    setLoading(false);
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

  const pendentes = sales.filter((s) => s.fiscal_status !== "emitida").length;

  return (
    <div className="p-5 md:p-8 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <Receipt className="w-5 h-5 text-emerald-600" /> Fiscal — NFC-e
        </h1>
        <p className="text-sm text-muted-foreground">
          {pendentes} venda(s) aguardando emissão · ambiente de homologação (sandbox)
        </p>
      </div>

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
                <SaleFiscalRow key={s.id} sale={s} emitting={emittingId === s.id} onEmit={handleEmit} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}