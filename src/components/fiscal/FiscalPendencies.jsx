import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AlertTriangle, Wand2 } from "lucide-react";

export default function FiscalPendencies() {
  const [pending, setPending] = useState([]);
  const [fixing, setFixing] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    const res = await base44.functions.invoke("fiscalPendencies", {});
    setPending(res.data?.pending || []);
  };

  useEffect(() => { load(); }, []);

  const autoFix = async () => {
    setFixing(true);
    const res = await base44.functions.invoke("fiscalPendencies", { auto_fix: true, limit: 10 });
    toast({ title: "Consulta de NCM concluída", description: res.data?.message });
    setFixing(false);
    await load();
  };

  if (!pending.length) return null;

  return (
    <div className="bg-card rounded-xl border border-amber-300 p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            {pending.length} produto(s) sem NCM válido
          </p>
          <p className="text-xs text-muted-foreground">
            Esses cadastros impedem a emissão fiscal. Preencha o NCM em Estoque ou busque nas fontes oficiais.
          </p>
        </div>
        <Button variant="outline" disabled={fixing} onClick={autoFix}>
          <Wand2 className={`w-4 h-4 ${fixing ? "animate-pulse" : ""}`} />
          {fixing ? "Consultando..." : "Buscar NCM oficial"}
        </Button>
      </div>
      <ul className="text-xs text-muted-foreground grid sm:grid-cols-2 gap-1">
        {pending.slice(0, 12).map((p) => (
          <li key={p.id}>• {p.name}{p.sku ? ` (${p.sku})` : ""}</li>
        ))}
      </ul>
    </div>
  );
}